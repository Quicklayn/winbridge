import {
  AuthorizationIdSchema,
  PermissionSchema,
  type Permission
} from "@winbridge/protocol";
import {
  createPowerShellWindowsScreenCaptureWorker,
  type WindowsScreenCaptureNativeWorker,
  type WindowsScreenCaptureNativeWorkerFactory
} from "./persistent-worker.js";

export {
  createPowerShellWindowsScreenCaptureWorker,
  createPowerShellWindowsScreenCaptureWorkerCommand,
  DEFAULT_WINDOWS_CAPTURE_WORKER_MAX_REQUEST_BYTES,
  DEFAULT_WINDOWS_CAPTURE_WORKER_MAX_RESPONSE_BYTES,
  WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE
} from "./persistent-worker.js";
export type {
  PowerShellWindowsScreenCaptureWorkerOptions,
  WindowsScreenCaptureNativeWorker,
  WindowsScreenCaptureNativeWorkerFactory,
  WindowsScreenCaptureWorkerProcessFactory
} from "./persistent-worker.js";

export const DEFAULT_WINDOWS_CAPTURE_MAX_DATA_BASE64_BYTES = 48 * 1024;
export const DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_WIDTH = 1280;
export const DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_HEIGHT = 720;
export const DEFAULT_WINDOWS_CAPTURE_TIMEOUT_MS = 5_000;
export const DEFAULT_WINDOWS_CAPTURE_MAX_QUEUE_SIZE = 2;
export const MAX_WINDOWS_CAPTURE_TIMEOUT_MS = 2_147_483_647;
export const WINDOWS_SCREEN_CAPTURE_GRANT_ERROR_MESSAGE =
  "Windows screen capture requires an active visible screen:view grant";
export const WINDOWS_SCREEN_CAPTURE_PLATFORM_ERROR_MESSAGE =
  "Windows screen capture requires Windows platform";
export const WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE =
  "Windows screen capture output is invalid";
export const WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE =
  "Windows screen capture failed";

export type WindowsScreenCaptureGrant = Readonly<{
  authorizationId: string;
  authorizationStatus: "active";
  visibleToHost: boolean;
  permissions: readonly Permission[];
  peerConnected: boolean;
  expiresAt: string;
}>;

export type WindowsScreenCaptureFormat = "jpeg" | "png";

export type WindowsScreenCaptureFrame = Readonly<{
  authorizationId: string;
  capturedAt: string;
  format: WindowsScreenCaptureFormat;
  width: number;
  height: number;
  dataBase64: string;
  dataBase64Bytes: number;
}>;

export type WindowsScreenCaptureNativeRequest = Readonly<{
  timeoutMs: number;
  maxDataBase64Bytes: number;
  maxOutputBytes: number;
}>;

export type WindowsScreenCaptureNativeRunner = (
  request: WindowsScreenCaptureNativeRequest
) => Promise<string>;

export type WindowsScreenCaptureAdapterOptions = Readonly<{
  runner?: WindowsScreenCaptureNativeRunner;
  workerFactory?: WindowsScreenCaptureNativeWorkerFactory;
  platform?: NodeJS.Platform;
  now?: () => Date;
  maxDataBase64Bytes?: number;
  timeoutMs?: number;
  maxQueueSize?: number;
}>;

export type WindowsScreenCaptureAdapter = Readonly<{
  capturePrimaryScreen(grant: WindowsScreenCaptureGrant): Promise<WindowsScreenCaptureFrame>;
  close(): void;
}>;

type NativeCaptureOutput = Readonly<{
  format: WindowsScreenCaptureFormat;
  width: number;
  height: number;
  dataBase64: string;
}>;

type QueuedWindowsScreenCapture = {
  generation: number;
  grant: WindowsScreenCaptureGrant;
  resolve(frame: WindowsScreenCaptureFrame): void;
  reject(error: Error): void;
};

type ActiveWindowsScreenCapture = {
  entry: QueuedWindowsScreenCapture;
  settled: boolean;
};

const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const MAX_SCREEN_DIMENSION = 16_384;
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff] as const;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
const JPEG_QUALITY_LEVELS = [70, 55, 40, 30, 20] as const;
const PREVIEW_DIMENSION_SCALES = [1, 0.75, 0.5, 0.35, 0.25, 0.18, 0.12] as const;

function createPowerShellCaptureScript(options: {
  readonly maxDataBase64Bytes: number;
  readonly previewMaxWidth: number;
  readonly previewMaxHeight: number;
}): string {
  return `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$maxDataBase64Bytes = ${options.maxDataBase64Bytes}
$maxPreviewWidth = ${options.previewMaxWidth}
$maxPreviewHeight = ${options.previewMaxHeight}
$qualities = @(${JPEG_QUALITY_LEVELS.join(", ")})
$dimensionScales = @(${PREVIEW_DIMENSION_SCALES.join(", ")})
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$sourceBitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$sourceGraphics = [System.Drawing.Graphics]::FromImage($sourceBitmap)
try {
  $sourceGraphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
  $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" } | Select-Object -First 1
  if ($null -eq $jpegCodec) {
    throw "JPEG encoder unavailable"
  }

  $baseScale = [Math]::Min($maxPreviewWidth / [double]$bounds.Width, $maxPreviewHeight / [double]$bounds.Height)
  if ($baseScale -gt 1) {
    $baseScale = 1
  }
  $baseWidth = [Math]::Max(1, [int][Math]::Round($bounds.Width * $baseScale))
  $baseHeight = [Math]::Max(1, [int][Math]::Round($bounds.Height * $baseScale))
  $encoded = $null

  foreach ($dimensionScale in $dimensionScales) {
    $targetWidth = [Math]::Max(1, [int][Math]::Round($baseWidth * [double]$dimensionScale))
    $targetHeight = [Math]::Max(1, [int][Math]::Round($baseHeight * [double]$dimensionScale))
    $targetBitmap = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight
    $targetGraphics = [System.Drawing.Graphics]::FromImage($targetBitmap)
    try {
      $targetGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $targetGraphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $targetGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $targetGraphics.DrawImage($sourceBitmap, 0, 0, $targetWidth, $targetHeight)

      foreach ($quality in $qualities) {
        $stream = New-Object System.IO.MemoryStream
        $encoderParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
        $encoderParameter = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [int64]$quality)
        try {
          $encoderParameters.Param[0] = $encoderParameter
          $targetBitmap.Save($stream, $jpegCodec, $encoderParameters)
          $dataBase64 = [Convert]::ToBase64String($stream.ToArray())
          if ($dataBase64.Length -le $maxDataBase64Bytes) {
            $encoded = [pscustomobject]@{
              format = "jpeg"
              width = $targetWidth
              height = $targetHeight
              dataBase64 = $dataBase64
            }
            break
          }
        } finally {
          $encoderParameter.Dispose()
          $encoderParameters.Dispose()
          $stream.Dispose()
        }
      }
    } finally {
      $targetGraphics.Dispose()
      $targetBitmap.Dispose()
    }

    if ($null -ne $encoded) {
      break
    }
  }

  if ($null -eq $encoded) {
    throw "Unable to fit JPEG preview"
  }

  $encoded | ConvertTo-Json -Compress
} finally {
  $sourceGraphics.Dispose()
  $sourceBitmap.Dispose()
}
`;
}

export function createWindowsScreenCaptureAdapter(
  options: WindowsScreenCaptureAdapterOptions = {}
): WindowsScreenCaptureAdapter {
  if (options.runner !== undefined && options.workerFactory !== undefined) {
    throw new Error(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
  }

  const runner = options.runner;
  const platform = options.platform ?? process.platform;
  const now = options.now ?? (() => new Date());
  const timeoutMs = validateBoundedPositiveSafeInteger(
    options.timeoutMs ?? DEFAULT_WINDOWS_CAPTURE_TIMEOUT_MS,
    MAX_WINDOWS_CAPTURE_TIMEOUT_MS,
    WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE
  );
  const maxDataBase64Bytes = validateBoundedPositiveSafeInteger(
    options.maxDataBase64Bytes ?? DEFAULT_WINDOWS_CAPTURE_MAX_DATA_BASE64_BYTES,
    DEFAULT_WINDOWS_CAPTURE_MAX_DATA_BASE64_BYTES,
    WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE
  );
  const maxOutputBytes = maxDataBase64Bytes + 4096;
  const maxQueueSize = validateBoundedPositiveSafeInteger(
    options.maxQueueSize ?? DEFAULT_WINDOWS_CAPTURE_MAX_QUEUE_SIZE,
    DEFAULT_WINDOWS_CAPTURE_MAX_QUEUE_SIZE,
    WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE
  );
  const workerFactory =
    options.workerFactory ??
    (() =>
      createPowerShellWindowsScreenCaptureWorker({
        maxDataBase64Bytes,
        maxOutputBytes,
        previewMaxWidth: DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_WIDTH,
        previewMaxHeight: DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_HEIGHT
      }));
  let generation = 0;
  let worker: WindowsScreenCaptureNativeWorker | undefined;
  let active: ActiveWindowsScreenCapture | undefined;
  const queue: QueuedWindowsScreenCapture[] = [];

  const close = () => {
    generation += 1;
    const error = new Error(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
    const activeToClose = active;
    active = undefined;
    if (activeToClose && !activeToClose.settled) {
      activeToClose.settled = true;
      activeToClose.entry.reject(error);
    }
    for (const entry of queue.splice(0)) {
      entry.reject(new Error(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE));
    }
    const workerToClose = worker;
    worker = undefined;
    closeNativeWorkerBestEffort(workerToClose);
  };

  const discardWorker = (workerToDiscard: WindowsScreenCaptureNativeWorker): void => {
    if (worker !== workerToDiscard) {
      return;
    }
    worker = undefined;
    closeNativeWorkerBestEffort(workerToDiscard);
  };

  const dispatchNativeCapture = async (
    entry: QueuedWindowsScreenCapture
  ): Promise<WindowsScreenCaptureFrame> => {
    if (entry.generation !== generation) {
      throw new Error(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
    }

    assertCaptureGrant(entry.grant, platform, now());
    const request = {
      timeoutMs,
      maxDataBase64Bytes,
      maxOutputBytes
    } as const;
    let output: string;
    let activeWorker: WindowsScreenCaptureNativeWorker | undefined;
    if (runner) {
      output = await runNativeCapture(runner, request);
    } else {
      activeWorker = worker;
      if (!activeWorker) {
        try {
          activeWorker = workerFactory();
          worker = activeWorker;
        } catch {
          throw new Error(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
        }
      }

      const workerForRequest = activeWorker;
      try {
        output = await runNativeCapture(
          (nativeRequest) => workerForRequest.run(nativeRequest),
          request
        );
      } catch (error) {
        discardWorker(workerForRequest);
        throw error;
      }
    }

    if (entry.generation !== generation) {
      throw new Error(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
    }

    let frame: NativeCaptureOutput;
    try {
      frame = parseNativeCaptureOutput(output, maxDataBase64Bytes);
    } catch (error) {
      if (activeWorker) {
        discardWorker(activeWorker);
      }
      throw error;
    }

    const completedAt = now();
    assertCaptureGrant(entry.grant, platform, completedAt);
    return {
      authorizationId: entry.grant.authorizationId,
      capturedAt: completedAt.toISOString(),
      ...frame,
      dataBase64Bytes: Buffer.byteLength(frame.dataBase64, "utf8")
    };
  };

  const drain = () => {
    if (active || queue.length === 0) {
      return;
    }

    const entry = queue.shift();
    if (!entry) {
      return;
    }

    if (entry.generation !== generation) {
      entry.reject(new Error(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE));
      queueMicrotask(drain);
      return;
    }

    const activeCapture: ActiveWindowsScreenCapture = { entry, settled: false };
    active = activeCapture;
    void dispatchNativeCapture(entry)
      .then(
        (frame) => {
          if (!activeCapture.settled) {
            activeCapture.settled = true;
            entry.resolve(frame);
          }
        },
        (error: unknown) => {
          if (!activeCapture.settled) {
            activeCapture.settled = true;
            entry.reject(
              error instanceof Error
                ? error
                : new Error(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE)
            );
          }
        }
      )
      .finally(() => {
        if (active === activeCapture) {
          active = undefined;
        }
        drain();
      });
  };

  return {
    capturePrimaryScreen(grant) {
      assertCaptureGrant(grant, platform, now());
      if (queue.length + (active ? 1 : 0) >= maxQueueSize) {
        return Promise.reject(new Error(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE));
      }
      const grantSnapshot: WindowsScreenCaptureGrant = {
        authorizationId: grant.authorizationId,
        authorizationStatus: grant.authorizationStatus,
        visibleToHost: grant.visibleToHost,
        permissions: [...grant.permissions],
        peerConnected: grant.peerConnected,
        expiresAt: grant.expiresAt
      };

      return new Promise<WindowsScreenCaptureFrame>((resolve, reject) => {
        queue.push({ generation, grant: grantSnapshot, resolve, reject });
        drain();
      });
    },
    close
  };
}

export async function capturePrimaryScreen(
  grant: WindowsScreenCaptureGrant,
  options: WindowsScreenCaptureAdapterOptions = {}
): Promise<WindowsScreenCaptureFrame> {
  const adapter = createWindowsScreenCaptureAdapter(options);
  try {
    return await adapter.capturePrimaryScreen(grant);
  } finally {
    adapter.close();
  }
}

export function createPowerShellPrimaryScreenCaptureCommand(
  options: {
    readonly maxDataBase64Bytes?: number;
    readonly previewMaxWidth?: number;
    readonly previewMaxHeight?: number;
  } = {}
): readonly string[] {
  const maxDataBase64Bytes = validateBoundedPositiveSafeInteger(
    options.maxDataBase64Bytes ?? DEFAULT_WINDOWS_CAPTURE_MAX_DATA_BASE64_BYTES,
    DEFAULT_WINDOWS_CAPTURE_MAX_DATA_BASE64_BYTES,
    WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE
  );
  const previewMaxWidth = validateBoundedPositiveSafeInteger(
    options.previewMaxWidth ?? DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_WIDTH,
    MAX_SCREEN_DIMENSION,
    WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE
  );
  const previewMaxHeight = validateBoundedPositiveSafeInteger(
    options.previewMaxHeight ?? DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_HEIGHT,
    MAX_SCREEN_DIMENSION,
    WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE
  );

  return [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    createPowerShellCaptureScript({
      maxDataBase64Bytes,
      previewMaxWidth,
      previewMaxHeight
    })
  ];
}

async function runNativeCapture(
  runner: WindowsScreenCaptureNativeRunner,
  request: WindowsScreenCaptureNativeRequest
): Promise<string> {
  try {
    return await runner(request);
  } catch {
    throw new Error(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
  }
}

function assertCaptureGrant(
  grant: WindowsScreenCaptureGrant,
  platform: NodeJS.Platform,
  now: Date
): void {
  if (platform !== "win32") {
    throw new Error(WINDOWS_SCREEN_CAPTURE_PLATFORM_ERROR_MESSAGE);
  }

  try {
    AuthorizationIdSchema.parse(grant.authorizationId);
    const permissions = grant.permissions.map((permission) => PermissionSchema.parse(permission));
    if (
      grant.authorizationStatus !== "active" ||
      !grant.visibleToHost ||
      !grant.peerConnected ||
      !permissions.includes("screen:view") ||
      !isFutureIsoDate(grant.expiresAt, now)
    ) {
      throw new Error(WINDOWS_SCREEN_CAPTURE_GRANT_ERROR_MESSAGE);
    }
  } catch {
    throw new Error(WINDOWS_SCREEN_CAPTURE_GRANT_ERROR_MESSAGE);
  }
}

function closeNativeWorkerBestEffort(worker: WindowsScreenCaptureNativeWorker | undefined): void {
  try {
    worker?.close();
  } catch {
    // Authorization loss and adapter shutdown must not expose native diagnostics.
  }
}

function parseNativeCaptureOutput(
  output: string,
  maxDataBase64Bytes: number
): NativeCaptureOutput {
  try {
    const parsed = JSON.parse(output);
    if (!isRecord(parsed)) {
      throw new Error(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
    }

    const { format, width, height, dataBase64 } = parsed;
    if (
      !isSupportedNativeCaptureFormat(format) ||
      !isScreenDimension(width) ||
      !isScreenDimension(height) ||
      typeof dataBase64 !== "string" ||
      dataBase64.length === 0 ||
      !BASE64_PATTERN.test(dataBase64) ||
      Buffer.byteLength(dataBase64, "utf8") > maxDataBase64Bytes ||
      !hasImageSignature(format, dataBase64)
    ) {
      throw new Error(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
    }

    return { format, width, height, dataBase64 };
  } catch {
    throw new Error(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScreenDimension(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_SCREEN_DIMENSION;
}

function isSupportedNativeCaptureFormat(value: unknown): value is WindowsScreenCaptureFormat {
  return value === "jpeg" || value === "png";
}

function isFutureIsoDate(value: string, now: Date): boolean {
  const expiresAtMs = Date.parse(value);
  return Number.isFinite(expiresAtMs) && expiresAtMs > now.getTime();
}

function hasImageSignature(format: WindowsScreenCaptureFormat, dataBase64: string): boolean {
  const data = Buffer.from(dataBase64, "base64");

  if (format === "jpeg") {
    if (data.length < JPEG_SIGNATURE.length) {
      return false;
    }

    return JPEG_SIGNATURE.every((byte, index) => data[index] === byte);
  }

  if (data.length < PNG_SIGNATURE.length) {
    return false;
  }
  return PNG_SIGNATURE.every((byte, index) => data[index] === byte);
}

function validateBoundedPositiveSafeInteger(value: number, max: number, message: string): number {
  if (!Number.isSafeInteger(value) || value <= 0 || value > max) {
    throw new Error(message);
  }

  return value;
}
