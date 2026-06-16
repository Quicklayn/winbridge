import { execFile } from "node:child_process";
import {
  AuthorizationIdSchema,
  PermissionSchema,
  type Permission
} from "@winbridge/protocol";

export const DEFAULT_WINDOWS_CAPTURE_MAX_DATA_BASE64_BYTES = 48 * 1024;
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

export type WindowsScreenCaptureFrame = Readonly<{
  authorizationId: string;
  capturedAt: string;
  format: "png";
  width: number;
  height: number;
  dataBase64: string;
  dataBase64Bytes: number;
}>;

export type WindowsScreenCaptureNativeRequest = Readonly<{
  timeoutMs: number;
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
  format: "png";
  width: number;
  height: number;
  dataBase64: string;
}>;

const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const MAX_SCREEN_DIMENSION = 16_384;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
const POWERSHELL_CAPTURE_SCRIPT = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$stream = New-Object System.IO.MemoryStream
try {
  $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
  $bytes = $stream.ToArray()
  [pscustomobject]@{
    format = "png"
    width = $bounds.Width
    height = $bounds.Height
    dataBase64 = [Convert]::ToBase64String($bytes)
  } | ConvertTo-Json -Compress
} finally {
  $stream.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}
`;

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

export function createPowerShellPrimaryScreenCaptureCommand(): readonly string[] {
  return ["-NoProfile", "-NonInteractive", "-Command", POWERSHELL_CAPTURE_SCRIPT];
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
      [...createPowerShellPrimaryScreenCaptureCommand()],
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
      format !== "png" ||
      !isScreenDimension(width) ||
      !isScreenDimension(height) ||
      typeof dataBase64 !== "string" ||
      dataBase64.length === 0 ||
      !BASE64_PATTERN.test(dataBase64) ||
      Buffer.byteLength(dataBase64, "utf8") > maxDataBase64Bytes ||
      !hasPngSignature(dataBase64)
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

function isFutureIsoDate(value: string, now: Date): boolean {
  const expiresAtMs = Date.parse(value);
  return Number.isFinite(expiresAtMs) && expiresAtMs > now.getTime();
}

function hasPngSignature(dataBase64: string): boolean {
  const data = Buffer.from(dataBase64, "base64");
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
