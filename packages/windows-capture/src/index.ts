import { execFile } from "node:child_process";
import {
  AuthorizationIdSchema,
  PermissionSchema,
  type Permission
} from "@winbridge/protocol";

export const DEFAULT_WINDOWS_CAPTURE_MAX_DATA_BASE64_BYTES = 48 * 1024;
export const DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_WIDTH = 1280;
export const DEFAULT_WINDOWS_CAPTURE_PREVIEW_MAX_HEIGHT = 720;
export const DEFAULT_WINDOWS_CAPTURE_TIMEOUT_MS = 5_000;
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
  platform?: NodeJS.Platform;
  now?: () => Date;
  maxDataBase64Bytes?: number;
  timeoutMs?: number;
}>;

export type WindowsScreenCaptureAdapter = Readonly<{
  capturePrimaryScreen(grant: WindowsScreenCaptureGrant): Promise<WindowsScreenCaptureFrame>;
}>;

type NativeCaptureOutput = Readonly<{
  format: WindowsScreenCaptureFormat;
  width: number;
  height: number;
  dataBase64: string;
}>;

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
  const runner = options.runner ?? runPowerShellPrimaryScreenCapture;
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

  return {
    async capturePrimaryScreen(grant) {
      assertCaptureGrant(grant, platform, now());
      const output = await runNativeCapture(runner, {
        timeoutMs,
        maxDataBase64Bytes,
        maxOutputBytes: maxDataBase64Bytes + 4096
      });
      const frame = parseNativeCaptureOutput(output, maxDataBase64Bytes);

      return {
        authorizationId: grant.authorizationId,
        capturedAt: now().toISOString(),
        ...frame,
        dataBase64Bytes: Buffer.byteLength(frame.dataBase64, "utf8")
      };
    }
  };
}

export async function capturePrimaryScreen(
  grant: WindowsScreenCaptureGrant,
  options: WindowsScreenCaptureAdapterOptions = {}
): Promise<WindowsScreenCaptureFrame> {
  return createWindowsScreenCaptureAdapter(options).capturePrimaryScreen(grant);
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

function runPowerShellPrimaryScreenCapture(
  request: WindowsScreenCaptureNativeRequest
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      [...createPowerShellPrimaryScreenCaptureCommand({
        maxDataBase64Bytes: request.maxDataBase64Bytes
      })],
      {
        timeout: request.timeoutMs,
        maxBuffer: request.maxOutputBytes
      },
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(stdout);
      }
    );
  });
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
