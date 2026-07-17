import { Buffer } from "node:buffer";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { stringifyJson } from "@winbridge/protocol";
import type { WindowsScreenCaptureNativeRequest } from "./index.js";

export const DEFAULT_WINDOWS_CAPTURE_WORKER_MAX_REQUEST_BYTES = 256;
export const DEFAULT_WINDOWS_CAPTURE_WORKER_MAX_RESPONSE_BYTES = 48 * 1024 + 4096;
export const WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE = "Windows screen capture worker failed";

export type WindowsScreenCaptureNativeWorker = Readonly<{
  run(request: WindowsScreenCaptureNativeRequest): Promise<string>;
  close(): void;
}>;

export type WindowsScreenCaptureNativeWorkerFactory = () => WindowsScreenCaptureNativeWorker;

export type WindowsScreenCaptureWorkerProcessFactory = () => ChildProcessWithoutNullStreams;

export type PowerShellWindowsScreenCaptureWorkerOptions = Readonly<{
  processFactory?: WindowsScreenCaptureWorkerProcessFactory;
  maxDataBase64Bytes?: number;
  maxOutputBytes?: number;
  maxRequestBytes?: number;
  previewMaxWidth?: number;
  previewMaxHeight?: number;
}>;

type PendingWorkerRequest = {
  requestId: number;
  maxOutputBytes: number;
  timer: ReturnType<typeof setTimeout>;
  resolve(output: string): void;
  reject(error: Error): void;
};

const MAX_WINDOWS_CAPTURE_WORKER_TIMEOUT_MS = 2_147_483_647;
const MAX_WINDOWS_CAPTURE_DATA_BASE64_BYTES = 48 * 1024;
const MAX_WINDOWS_CAPTURE_SCREEN_DIMENSION = 16_384;
const DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_WIDTH = 1280;
const DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_HEIGHT = 720;
const WINDOWS_CAPTURE_OUTPUT_OVERHEAD_BYTES = 4096;
const JPEG_QUALITY_LEVELS = [70, 55, 40, 30, 20] as const;
const PREVIEW_DIMENSION_SCALES = [1, 0.75, 0.5, 0.35, 0.25, 0.18, 0.12] as const;

function createPowerShellCaptureWorkerScript(options: {
  readonly maxDataBase64Bytes: number;
  readonly previewMaxWidth: number;
  readonly previewMaxHeight: number;
}): string {
  return `
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$maxDataBase64Bytes = ${options.maxDataBase64Bytes}
$maxPreviewWidth = ${options.previewMaxWidth}
$maxPreviewHeight = ${options.previewMaxHeight}
$qualities = @(${JPEG_QUALITY_LEVELS.join(", ")})
$dimensionScales = @(${PREVIEW_DIMENSION_SCALES.join(", ")})
function Invoke-WinBridgeScreenCapture {
  $sourceBitmap = $null
  $sourceGraphics = $null
  try {
    $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    $sourceBitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
    $sourceGraphics = [System.Drawing.Graphics]::FromImage($sourceBitmap)
    $sourceGraphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" } | Select-Object -First 1
    if ($null -eq $jpegCodec) { throw "JPEG encoder unavailable" }

    $baseScale = [Math]::Min($maxPreviewWidth / [double]$bounds.Width, $maxPreviewHeight / [double]$bounds.Height)
    if ($baseScale -gt 1) { $baseScale = 1 }
    $baseWidth = [Math]::Max(1, [int][Math]::Round($bounds.Width * $baseScale))
    $baseHeight = [Math]::Max(1, [int][Math]::Round($bounds.Height * $baseScale))
    $encoded = $null

    foreach ($dimensionScale in $dimensionScales) {
      $targetBitmap = $null
      $targetGraphics = $null
      try {
        $targetWidth = [Math]::Max(1, [int][Math]::Round($baseWidth * [double]$dimensionScale))
        $targetHeight = [Math]::Max(1, [int][Math]::Round($baseHeight * [double]$dimensionScale))
        $targetBitmap = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight
        $targetGraphics = [System.Drawing.Graphics]::FromImage($targetBitmap)
        $targetGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $targetGraphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $targetGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $targetGraphics.DrawImage($sourceBitmap, 0, 0, $targetWidth, $targetHeight)

        foreach ($quality in $qualities) {
          $stream = $null
          $encoderParameters = $null
          $encoderParameter = $null
          try {
            $stream = New-Object System.IO.MemoryStream
            $encoderParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
            $encoderParameter = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [int64]$quality)
            $encoderParameters.Param[0] = $encoderParameter
            $targetBitmap.Save($stream, $jpegCodec, $encoderParameters)
            $dataBase64 = [Convert]::ToBase64String($stream.ToArray())
            if ($dataBase64.Length -le $maxDataBase64Bytes) {
              $encoded = [ordered]@{
                format = "jpeg"
                width = $targetWidth
                height = $targetHeight
                dataBase64 = $dataBase64
              }
              break
            }
          } finally {
            if ($null -ne $encoderParameter) { $encoderParameter.Dispose() }
            if ($null -ne $encoderParameters) { $encoderParameters.Dispose() }
            if ($null -ne $stream) { $stream.Dispose() }
          }
        }
      } finally {
        if ($null -ne $targetGraphics) { $targetGraphics.Dispose() }
        if ($null -ne $targetBitmap) { $targetBitmap.Dispose() }
      }

      if ($null -ne $encoded) { break }
    }

    if ($null -eq $encoded) { throw "Unable to fit JPEG preview" }
    return $encoded
  } finally {
    if ($null -ne $sourceGraphics) { $sourceGraphics.Dispose() }
    if ($null -ne $sourceBitmap) { $sourceBitmap.Dispose() }
  }
}
while ($null -ne ($line = [Console]::In.ReadLine())) {
  $requestId = 0
  try {
    $request = $line | ConvertFrom-Json
    $propertyNames = @($request.PSObject.Properties.Name)
    if ($propertyNames.Count -ne 1 -or $propertyNames[0] -ne "requestId") { throw "Invalid request" }
    $requestId = [long]$request.requestId
    if ($requestId -lt 1) { throw "Invalid request id" }
    $frame = Invoke-WinBridgeScreenCapture
    [Console]::Out.WriteLine(([ordered]@{
      requestId = $requestId
      ok = $true
      format = $frame.format
      width = $frame.width
      height = $frame.height
      dataBase64 = $frame.dataBase64
    } | ConvertTo-Json -Compress))
  } catch {
    [Console]::Out.WriteLine(([ordered]@{ requestId = $requestId; ok = $false } | ConvertTo-Json -Compress))
  }
  [Console]::Out.Flush()
}
`;
}

export function createPowerShellWindowsScreenCaptureWorkerCommand(
  options: {
    readonly maxDataBase64Bytes?: number;
    readonly previewMaxWidth?: number;
    readonly previewMaxHeight?: number;
  } = {}
): readonly string[] {
  const maxDataBase64Bytes = validateBoundedPositiveSafeInteger(
    options.maxDataBase64Bytes ?? MAX_WINDOWS_CAPTURE_DATA_BASE64_BYTES,
    MAX_WINDOWS_CAPTURE_DATA_BASE64_BYTES
  );
  const previewMaxWidth = validateBoundedPositiveSafeInteger(
    options.previewMaxWidth ?? DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_WIDTH,
    MAX_WINDOWS_CAPTURE_SCREEN_DIMENSION
  );
  const previewMaxHeight = validateBoundedPositiveSafeInteger(
    options.previewMaxHeight ?? DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_HEIGHT,
    MAX_WINDOWS_CAPTURE_SCREEN_DIMENSION
  );

  return [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    createPowerShellCaptureWorkerScript({
      maxDataBase64Bytes,
      previewMaxWidth,
      previewMaxHeight
    })
  ];
}

export function createPowerShellWindowsScreenCaptureWorker(
  options: PowerShellWindowsScreenCaptureWorkerOptions = {}
): WindowsScreenCaptureNativeWorker {
  const maxDataBase64Bytes = validateBoundedPositiveSafeInteger(
    options.maxDataBase64Bytes ?? MAX_WINDOWS_CAPTURE_DATA_BASE64_BYTES,
    MAX_WINDOWS_CAPTURE_DATA_BASE64_BYTES
  );
  const maxOutputBytes = validateConsistentMaxOutputBytes(
    options.maxOutputBytes ?? maxDataBase64Bytes + WINDOWS_CAPTURE_OUTPUT_OVERHEAD_BYTES,
    maxDataBase64Bytes
  );
  const maxRequestBytes = validateBoundedPositiveSafeInteger(
    options.maxRequestBytes ?? DEFAULT_WINDOWS_CAPTURE_WORKER_MAX_REQUEST_BYTES,
    DEFAULT_WINDOWS_CAPTURE_WORKER_MAX_REQUEST_BYTES
  );
  const command = createPowerShellWindowsScreenCaptureWorkerCommand({
    maxDataBase64Bytes,
    previewMaxWidth: options.previewMaxWidth,
    previewMaxHeight: options.previewMaxHeight
  });
  const processFactory =
    options.processFactory ?? (() => defaultWindowsCaptureWorkerProcessFactory(command));
  let child: ChildProcessWithoutNullStreams;
  try {
    child = processFactory();
  } catch {
    throw new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE);
  }

  let closed = false;
  let nextRequestId = 1;
  let responseBytes = 0;
  let responseChunks: Buffer[] = [];
  let pending: PendingWorkerRequest | undefined;

  child.stderr.on("data", () => failWorker());
  child.stdout.on("data", (chunk: Buffer | string) => handleStdoutData(chunk));
  child.once("error", () => failWorker());
  child.once("exit", () => failWorker());

  function failWorker(): void {
    if (closed) {
      return;
    }

    closed = true;
    responseBytes = 0;
    responseChunks = [];
    const active = pending;
    pending = undefined;
    if (active) {
      clearTimeout(active.timer);
      active.reject(new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE));
    }
    terminateChild(child);
  }

  function handleStdoutData(chunk: Buffer | string): void {
    if (closed) {
      return;
    }

    const active = pending;
    if (!active) {
      failWorker();
      return;
    }

    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, "utf8");
    responseBytes += bytes.byteLength;
    if (responseBytes > active.maxOutputBytes) {
      failWorker();
      return;
    }

    const newlineIndex = bytes.indexOf(0x0a);
    if (newlineIndex < 0) {
      responseChunks.push(bytes);
      return;
    }

    if (newlineIndex !== bytes.byteLength - 1) {
      failWorker();
      return;
    }

    responseChunks.push(bytes.subarray(0, newlineIndex));
    let lineBytes = Buffer.concat(responseChunks);
    if (lineBytes.at(-1) === 0x0d) {
      lineBytes = lineBytes.subarray(0, lineBytes.byteLength - 1);
    }

    let output: string;
    try {
      output = parseWorkerResponse(
        lineBytes.toString("utf8"),
        active.requestId,
        maxDataBase64Bytes
      );
    } catch {
      failWorker();
      return;
    }

    pending = undefined;
    responseBytes = 0;
    responseChunks = [];
    clearTimeout(active.timer);
    active.resolve(output);
  }

  return {
    run(request) {
      if (closed || pending) {
        return Promise.reject(new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE));
      }

      let timeoutMs: number;
      try {
        timeoutMs = parseWorkerRequest(request, maxDataBase64Bytes, maxOutputBytes);
      } catch {
        failWorker();
        return Promise.reject(new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE));
      }

      if (nextRequestId > Number.MAX_SAFE_INTEGER) {
        failWorker();
        return Promise.reject(new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE));
      }

      const requestId = nextRequestId;
      nextRequestId += 1;
      const payload = stringifyJson({ requestId });
      if (Buffer.byteLength(payload, "utf8") > maxRequestBytes) {
        failWorker();
        return Promise.reject(new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE));
      }

      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => failWorker(), timeoutMs);
        pending = { requestId, maxOutputBytes, timer, resolve, reject };
        try {
          child.stdin.write(`${payload}\n`, (error) => {
            if (error) {
              failWorker();
            }
          });
        } catch {
          failWorker();
        }
      });
    },
    close() {
      failWorker();
    }
  };
}

function parseWorkerRequest(
  request: unknown,
  configuredMaxDataBase64Bytes: number,
  configuredMaxOutputBytes: number
): number {
  if (
    !isRecord(request) ||
    !hasExactKeys(request, ["timeoutMs", "maxDataBase64Bytes", "maxOutputBytes"]) ||
    !isBoundedInteger(request.timeoutMs, 1, MAX_WINDOWS_CAPTURE_WORKER_TIMEOUT_MS) ||
    request.maxDataBase64Bytes !== configuredMaxDataBase64Bytes ||
    request.maxOutputBytes !== configuredMaxOutputBytes ||
    request.maxOutputBytes !== request.maxDataBase64Bytes + WINDOWS_CAPTURE_OUTPUT_OVERHEAD_BYTES
  ) {
    throw new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE);
  }

  return request.timeoutMs;
}

function parseWorkerResponse(
  line: string,
  requestId: number,
  maxDataBase64Bytes: number
): string {
  const parsed: unknown = JSON.parse(line);
  if (
    !isRecord(parsed) ||
    !hasExactKeys(parsed, ["requestId", "ok", "format", "width", "height", "dataBase64"]) ||
    parsed.requestId !== requestId ||
    parsed.ok !== true ||
    typeof parsed.dataBase64 !== "string" ||
    parsed.dataBase64.length === 0 ||
    Buffer.byteLength(parsed.dataBase64, "utf8") > maxDataBase64Bytes
  ) {
    throw new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE);
  }

  return stringifyJson({
    format: parsed.format,
    width: parsed.width,
    height: parsed.height,
    dataBase64: parsed.dataBase64
  });
}

function defaultWindowsCaptureWorkerProcessFactory(
  command: readonly string[]
): ChildProcessWithoutNullStreams {
  return spawn("powershell.exe", [...command], {
    detached: false,
    stdio: "pipe",
    windowsHide: true
  });
}

function terminateChild(child: ChildProcessWithoutNullStreams): void {
  try {
    child.stdin.destroy();
  } catch {
    // Shutdown must remain best-effort and diagnostics-free.
  }

  try {
    child.kill();
  } catch {
    // Shutdown must not delay authorization loss.
  }
}

function validateConsistentMaxOutputBytes(value: number, maxDataBase64Bytes: number): number {
  if (
    !Number.isSafeInteger(value) ||
    value !== maxDataBase64Bytes + WINDOWS_CAPTURE_OUTPUT_OVERHEAD_BYTES ||
    value > DEFAULT_WINDOWS_CAPTURE_WORKER_MAX_RESPONSE_BYTES
  ) {
    throw new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE);
  }

  return value;
}

function validateBoundedPositiveSafeInteger(value: number, max: number): number {
  if (!Number.isSafeInteger(value) || value <= 0 || value > max) {
    throw new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE);
  }

  return value;
}

function isBoundedInteger(value: unknown, min: number, max: number): value is number {
  return Number.isSafeInteger(value) && (value as number) >= min && (value as number) <= max;
}

function hasExactKeys(value: Record<string, unknown>, requiredKeys: readonly string[]): boolean {
  return (
    Object.keys(value).length === requiredKeys.length &&
    requiredKeys.every((key) => Object.hasOwn(value, key))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
