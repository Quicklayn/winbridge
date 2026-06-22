import { execFile } from "node:child_process";
import {
  AuthorizationIdSchema,
  InputEventMessageSchema,
  PermissionSchema,
  createMessageBase,
  stringifyJson,
  type Permission,
  type ProtocolEnvelope
} from "@winbridge/protocol";

export const DEFAULT_WINDOWS_INPUT_TIMEOUT_MS = 5_000;
export const MAX_WINDOWS_INPUT_TIMEOUT_MS = 2_147_483_647;
export const WINDOWS_INPUT_GRANT_ERROR_MESSAGE =
  "Windows input requires an active visible matching input grant";
export const WINDOWS_INPUT_PLATFORM_ERROR_MESSAGE =
  "Windows input requires Windows platform";
export const WINDOWS_INPUT_EVENT_ERROR_MESSAGE =
  "Windows input event is invalid";
export const WINDOWS_INPUT_OUTPUT_ERROR_MESSAGE =
  "Windows input output is invalid";
export const WINDOWS_INPUT_RUNNER_ERROR_MESSAGE =
  "Windows input failed";

export type WindowsInputGrant = Readonly<{
  authorizationId: string;
  authorizationStatus: "active";
  visibleToHost: boolean;
  permissions: readonly Permission[];
  peerConnected: boolean;
  expiresAt: string;
}>;

type InputEventEnvelope = Extract<ProtocolEnvelope, { type: "input-event" }>;

export type WindowsInputEvent = Readonly<
  Pick<InputEventEnvelope, "authorizationId" | "eventId" | "sequence" | "occurredAt" | "event">
>;

export type WindowsInputNativePointerEvent = Readonly<{
  kind: "pointer-move" | "pointer-down" | "pointer-up" | "pointer-wheel";
  x: number;
  y: number;
  xAbsolute: number;
  yAbsolute: number;
  button?: "primary" | "secondary" | "middle" | "back" | "forward";
  buttons?: number;
  deltaX?: number;
  deltaY?: number;
}>;

export type WindowsInputNativeKeyboardEvent = Readonly<{
  kind: "key-down" | "key-up";
  key: string;
  code?: string;
  virtualKey: number;
  modifiers: readonly WindowsInputNativeKeyboardModifier[];
}>;

export type WindowsInputNativeKeyboardModifier = Readonly<{
  modifier: "alt" | "control" | "meta" | "shift";
  virtualKey: number;
}>;

export type WindowsInputNativeEvent =
  | WindowsInputNativePointerEvent
  | WindowsInputNativeKeyboardEvent;

export type WindowsInputNativeRequest = Readonly<{
  timeoutMs: number;
  event: WindowsInputNativeEvent;
}>;

export type WindowsInputNativeRunner = (
  request: WindowsInputNativeRequest
) => Promise<string>;

export type WindowsInputApplyResult = Readonly<{
  authorizationId: string;
  eventId: string;
  inputKind: WindowsInputEvent["event"]["kind"];
  appliedAt: string;
}>;

export type WindowsInputAdapterOptions = Readonly<{
  runner?: WindowsInputNativeRunner;
  platform?: NodeJS.Platform;
  now?: () => Date;
  timeoutMs?: number;
}>;

export type WindowsInputAdapter = Readonly<{
  applyInputEvent(
    grant: WindowsInputGrant,
    input: WindowsInputEvent
  ): Promise<WindowsInputApplyResult>;
}>;

const INPUT_VALIDATION_SESSION_ID = "session-input-validation";
const INPUT_VALIDATION_FROM_PEER_ID = "peer-input-viewer";
const INPUT_VALIDATION_TO_PEER_ID = "peer-input-host";
const MAX_POWERSHELL_OUTPUT_BYTES = 4096;
const ABSOLUTE_POINTER_RANGE = 65_535;
const POINTER_WHEEL_DELTA_UNIT = 120;
const NATIVE_SUCCESS_OUTPUT = { applied: true } as const;

const VIRTUAL_KEY_BY_KEY = new Map<string, number>([
  ["Backspace", 0x08],
  ["Tab", 0x09],
  ["Enter", 0x0d],
  ["Escape", 0x1b],
  ["Space", 0x20],
  ["PageUp", 0x21],
  ["PageDown", 0x22],
  ["End", 0x23],
  ["Home", 0x24],
  ["ArrowLeft", 0x25],
  ["ArrowUp", 0x26],
  ["ArrowRight", 0x27],
  ["ArrowDown", 0x28],
  ["Insert", 0x2d],
  ["Delete", 0x2e],
  ["CapsLock", 0x14],
  ["ShiftLeft", 0xa0],
  ["ShiftRight", 0xa1],
  ["ControlLeft", 0xa2],
  ["ControlRight", 0xa3],
  ["AltLeft", 0xa4],
  ["AltRight", 0xa5],
  ["MetaLeft", 0x5b],
  ["MetaRight", 0x5c],
  ["ContextMenu", 0x5d],
  ["NumpadAdd", 0x6b],
  ["NumpadSubtract", 0x6d],
  ["NumpadMultiply", 0x6a],
  ["NumpadDivide", 0x6f],
  ["NumpadDecimal", 0x6e],
  ["NumpadEnter", 0x0d]
]);

const MODIFIER_VIRTUAL_KEY_BY_NAME = new Map<string, number>([
  ["alt", 0x12],
  ["control", 0x11],
  ["meta", 0x5b],
  ["shift", 0x10]
]);

for (let digit = 0; digit <= 9; digit += 1) {
  VIRTUAL_KEY_BY_KEY.set(`Digit${digit}`, 0x30 + digit);
  VIRTUAL_KEY_BY_KEY.set(`Numpad${digit}`, 0x60 + digit);
}

for (let letter = 0; letter < 26; letter += 1) {
  VIRTUAL_KEY_BY_KEY.set(`Key${String.fromCharCode(65 + letter)}`, 0x41 + letter);
}

for (let keyNumber = 1; keyNumber <= 24; keyNumber += 1) {
  VIRTUAL_KEY_BY_KEY.set(`F${keyNumber}`, 0x70 + keyNumber - 1);
}

const POWERSHELL_WINDOWS_INPUT_SCRIPT = `
param([Parameter(Mandatory=$true)][string]$RequestJson)
$ErrorActionPreference = "Stop"
$request = $RequestJson | ConvertFrom-Json
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class WinBridgeInput {
  [StructLayout(LayoutKind.Sequential)]
  public struct INPUT {
    public uint type;
    public InputUnion U;
  }
  [StructLayout(LayoutKind.Explicit)]
  public struct InputUnion {
    [FieldOffset(0)] public MOUSEINPUT mi;
    [FieldOffset(0)] public KEYBDINPUT ki;
  }
  [StructLayout(LayoutKind.Sequential)]
  public struct MOUSEINPUT {
    public int dx;
    public int dy;
    public uint mouseData;
    public uint dwFlags;
    public uint time;
    public IntPtr dwExtraInfo;
  }
  [StructLayout(LayoutKind.Sequential)]
  public struct KEYBDINPUT {
    public ushort wVk;
    public ushort wScan;
    public uint dwFlags;
    public uint time;
    public IntPtr dwExtraInfo;
  }
  [DllImport("user32.dll", SetLastError=true)]
  public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);
}
"@
function New-MouseInput([uint32]$flags, [int]$dx, [int]$dy, [uint32]$mouseData) {
  $input = New-Object WinBridgeInput+INPUT
  $input.type = 0
  $input.U.mi.dx = $dx
  $input.U.mi.dy = $dy
  $input.U.mi.mouseData = $mouseData
  $input.U.mi.dwFlags = $flags
  return $input
}
function New-KeyboardInput([uint16]$vk, [uint32]$flags) {
  $input = New-Object WinBridgeInput+INPUT
  $input.type = 1
  $input.U.ki.wVk = $vk
  $input.U.ki.dwFlags = $flags
  return $input
}
function Add-Input([System.Collections.Generic.List[WinBridgeInput+INPUT]]$inputs, [WinBridgeInput+INPUT]$input) {
  $inputs.Add($input) | Out-Null
}
function Convert-ToDword([int]$value) {
  return [BitConverter]::ToUInt32([BitConverter]::GetBytes([int]$value), 0)
}
$MOUSEEVENTF_MOVE = 0x0001
$MOUSEEVENTF_LEFTDOWN = 0x0002
$MOUSEEVENTF_LEFTUP = 0x0004
$MOUSEEVENTF_RIGHTDOWN = 0x0008
$MOUSEEVENTF_RIGHTUP = 0x0010
$MOUSEEVENTF_MIDDLEDOWN = 0x0020
$MOUSEEVENTF_MIDDLEUP = 0x0040
$MOUSEEVENTF_XDOWN = 0x0080
$MOUSEEVENTF_XUP = 0x0100
$MOUSEEVENTF_WHEEL = 0x0800
$MOUSEEVENTF_HWHEEL = 0x01000
$MOUSEEVENTF_ABSOLUTE = 0x8000
$KEYEVENTF_KEYUP = 0x0002
$XBUTTON1 = 0x0001
$XBUTTON2 = 0x0002
$inputs = New-Object 'System.Collections.Generic.List[WinBridgeInput+INPUT]'
$event = $request.event
switch ($event.kind) {
  "pointer-move" {
    Add-Input $inputs (New-MouseInput ($MOUSEEVENTF_MOVE -bor $MOUSEEVENTF_ABSOLUTE) $event.xAbsolute $event.yAbsolute 0)
  }
  "pointer-down" {
    Add-Input $inputs (New-MouseInput ($MOUSEEVENTF_MOVE -bor $MOUSEEVENTF_ABSOLUTE) $event.xAbsolute $event.yAbsolute 0)
    switch ($event.button) {
      "primary" { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_LEFTDOWN 0 0 0) }
      "secondary" { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_RIGHTDOWN 0 0 0) }
      "middle" { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_MIDDLEDOWN 0 0 0) }
      "back" { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_XDOWN 0 0 $XBUTTON1) }
      "forward" { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_XDOWN 0 0 $XBUTTON2) }
    }
  }
  "pointer-up" {
    Add-Input $inputs (New-MouseInput ($MOUSEEVENTF_MOVE -bor $MOUSEEVENTF_ABSOLUTE) $event.xAbsolute $event.yAbsolute 0)
    switch ($event.button) {
      "primary" { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_LEFTUP 0 0 0) }
      "secondary" { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_RIGHTUP 0 0 0) }
      "middle" { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_MIDDLEUP 0 0 0) }
      "back" { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_XUP 0 0 $XBUTTON1) }
      "forward" { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_XUP 0 0 $XBUTTON2) }
    }
  }
  "pointer-wheel" {
    Add-Input $inputs (New-MouseInput ($MOUSEEVENTF_MOVE -bor $MOUSEEVENTF_ABSOLUTE) $event.xAbsolute $event.yAbsolute 0)
    if ($event.deltaY -ne 0) { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_WHEEL 0 0 (Convert-ToDword ([int]$event.deltaY))) }
    if ($event.deltaX -ne 0) { Add-Input $inputs (New-MouseInput $MOUSEEVENTF_HWHEEL 0 0 (Convert-ToDword ([int]$event.deltaX))) }
  }
  "key-down" {
    foreach ($modifier in $event.modifiers) { Add-Input $inputs (New-KeyboardInput ([uint16]$modifier.virtualKey) 0) }
    Add-Input $inputs (New-KeyboardInput ([uint16]$event.virtualKey) 0)
    for ($i = $event.modifiers.Count - 1; $i -ge 0; $i--) { Add-Input $inputs (New-KeyboardInput ([uint16]$event.modifiers[$i].virtualKey) $KEYEVENTF_KEYUP) }
  }
  "key-up" {
    Add-Input $inputs (New-KeyboardInput ([uint16]$event.virtualKey) $KEYEVENTF_KEYUP)
  }
}
if ($inputs.Count -lt 1) { throw "No input events" }
$array = $inputs.ToArray()
$sent = [WinBridgeInput]::SendInput([uint32]$array.Length, $array, [Runtime.InteropServices.Marshal]::SizeOf([type][WinBridgeInput+INPUT]))
if ($sent -ne $array.Length) { throw "SendInput failed" }
[pscustomobject]@{ applied = $true } | ConvertTo-Json -Compress
`;

export function createWindowsInputAdapter(
  options: WindowsInputAdapterOptions = {}
): WindowsInputAdapter {
  const runner = options.runner ?? runPowerShellWindowsInput;
  const platform = options.platform ?? process.platform;
  const now = options.now ?? (() => new Date());
  const timeoutMs = validateBoundedPositiveSafeInteger(
    options.timeoutMs ?? DEFAULT_WINDOWS_INPUT_TIMEOUT_MS,
    MAX_WINDOWS_INPUT_TIMEOUT_MS,
    WINDOWS_INPUT_OUTPUT_ERROR_MESSAGE
  );

  return {
    async applyInputEvent(grant, input) {
      const parsedInput = parseWindowsInputEvent(input);
      const requiredPermission = inputEventRequiredPermission(parsedInput.event);
      assertInputGrant(grant, platform, now(), parsedInput.authorizationId, requiredPermission);
      const nativeEvent = normalizeNativeInputEvent(parsedInput);
      await runNativeInput(runner, { timeoutMs, event: nativeEvent });

      return {
        authorizationId: parsedInput.authorizationId,
        eventId: parsedInput.eventId,
        inputKind: parsedInput.event.kind,
        appliedAt: now().toISOString()
      };
    }
  };
}

export async function applyWindowsInputEvent(
  grant: WindowsInputGrant,
  input: WindowsInputEvent,
  options: WindowsInputAdapterOptions = {}
): Promise<WindowsInputApplyResult> {
  return createWindowsInputAdapter(options).applyInputEvent(grant, input);
}

export function createPowerShellWindowsInputCommand(
  request: WindowsInputNativeRequest
): readonly string[] {
  return [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    POWERSHELL_WINDOWS_INPUT_SCRIPT,
    stringifyJson(request)
  ];
}

async function runNativeInput(
  runner: WindowsInputNativeRunner,
  request: WindowsInputNativeRequest
): Promise<void> {
  try {
    parseNativeInputOutput(await runner(request));
  } catch (error) {
    if (error instanceof WindowsInputOutputError) {
      throw new Error(WINDOWS_INPUT_OUTPUT_ERROR_MESSAGE);
    }

    throw new Error(WINDOWS_INPUT_RUNNER_ERROR_MESSAGE);
  }
}

function runPowerShellWindowsInput(request: WindowsInputNativeRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      [...createPowerShellWindowsInputCommand(request)],
      {
        timeout: request.timeoutMs,
        maxBuffer: MAX_POWERSHELL_OUTPUT_BYTES
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

function assertInputGrant(
  grant: WindowsInputGrant,
  platform: NodeJS.Platform,
  now: Date,
  authorizationId: string,
  requiredPermission: Permission
): void {
  if (platform !== "win32") {
    throw new Error(WINDOWS_INPUT_PLATFORM_ERROR_MESSAGE);
  }

  try {
    AuthorizationIdSchema.parse(grant.authorizationId);
    const permissions = grant.permissions.map((permission) => PermissionSchema.parse(permission));
    if (
      grant.authorizationId !== authorizationId ||
      grant.authorizationStatus !== "active" ||
      !grant.visibleToHost ||
      !grant.peerConnected ||
      !permissions.includes(requiredPermission) ||
      !isFutureIsoDate(grant.expiresAt, now)
    ) {
      throw new Error(WINDOWS_INPUT_GRANT_ERROR_MESSAGE);
    }
  } catch {
    throw new Error(WINDOWS_INPUT_GRANT_ERROR_MESSAGE);
  }
}

function parseWindowsInputEvent(input: WindowsInputEvent): WindowsInputEvent {
  if (!isRecord(input)) {
    throw new Error(WINDOWS_INPUT_EVENT_ERROR_MESSAGE);
  }

  try {
    const parsed = InputEventMessageSchema.parse({
      ...createMessageBase(INPUT_VALIDATION_SESSION_ID),
      type: "input-event",
      authorizationId: input.authorizationId,
      fromPeerId: INPUT_VALIDATION_FROM_PEER_ID,
      toPeerId: INPUT_VALIDATION_TO_PEER_ID,
      eventId: input.eventId,
      sequence: input.sequence,
      occurredAt: input.occurredAt,
      event: input.event
    }) as InputEventEnvelope;

    return {
      authorizationId: parsed.authorizationId,
      eventId: parsed.eventId,
      sequence: parsed.sequence,
      occurredAt: parsed.occurredAt,
      event: parsed.event
    };
  } catch {
    throw new Error(WINDOWS_INPUT_EVENT_ERROR_MESSAGE);
  }
}

function normalizeNativeInputEvent(input: WindowsInputEvent): WindowsInputNativeEvent {
  const { event } = input;

  switch (event.kind) {
    case "pointer-move":
      return {
        kind: event.kind,
        x: event.x,
        y: event.y,
        xAbsolute: toAbsolutePointerCoordinate(event.x),
        yAbsolute: toAbsolutePointerCoordinate(event.y),
        ...(event.buttons !== undefined ? { buttons: event.buttons } : {})
      };
    case "pointer-down":
    case "pointer-up":
      return {
        kind: event.kind,
        x: event.x,
        y: event.y,
        xAbsolute: toAbsolutePointerCoordinate(event.x),
        yAbsolute: toAbsolutePointerCoordinate(event.y),
        button: event.button,
        ...(event.buttons !== undefined ? { buttons: event.buttons } : {})
      };
    case "pointer-wheel":
      return {
        kind: event.kind,
        x: event.x,
        y: event.y,
        xAbsolute: toAbsolutePointerCoordinate(event.x),
        yAbsolute: toAbsolutePointerCoordinate(event.y),
        deltaX: event.deltaX * POINTER_WHEEL_DELTA_UNIT,
        deltaY: event.deltaY * POINTER_WHEEL_DELTA_UNIT
      };
    case "key-down":
    case "key-up":
      return {
        kind: event.kind,
        key: event.key,
        ...(event.code !== undefined ? { code: event.code } : {}),
        virtualKey: virtualKeyForProtocolKey(event.key),
        modifiers: event.modifiers.map((modifier) => ({
          modifier,
          virtualKey: virtualKeyForModifier(modifier)
        }))
      };
    default: {
      const exhaustive: never = event;
      throw new Error(WINDOWS_INPUT_EVENT_ERROR_MESSAGE);
    }
  }
}

function inputEventRequiredPermission(event: WindowsInputEvent["event"]): Permission {
  switch (event.kind) {
    case "key-down":
    case "key-up":
      return "input:keyboard";
    case "pointer-move":
    case "pointer-down":
    case "pointer-up":
    case "pointer-wheel":
      return "input:pointer";
    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
}

function virtualKeyForProtocolKey(key: string): number {
  const virtualKey = VIRTUAL_KEY_BY_KEY.get(key);
  if (virtualKey === undefined) {
    throw new Error(WINDOWS_INPUT_EVENT_ERROR_MESSAGE);
  }

  return virtualKey;
}

function virtualKeyForModifier(modifier: string): number {
  const virtualKey = MODIFIER_VIRTUAL_KEY_BY_NAME.get(modifier);
  if (virtualKey === undefined) {
    throw new Error(WINDOWS_INPUT_EVENT_ERROR_MESSAGE);
  }

  return virtualKey;
}

function toAbsolutePointerCoordinate(value: number): number {
  return Math.round(value * ABSOLUTE_POINTER_RANGE);
}

function parseNativeInputOutput(output: string): void {
  try {
    const parsed = JSON.parse(output);
    if (!isRecord(parsed) || parsed.applied !== NATIVE_SUCCESS_OUTPUT.applied) {
      throw new WindowsInputOutputError();
    }
  } catch (error) {
    if (error instanceof WindowsInputOutputError) {
      throw error;
    }

    throw new WindowsInputOutputError();
  }
}

function isFutureIsoDate(value: string, now: Date): boolean {
  const expiresAtMs = Date.parse(value);
  return Number.isFinite(expiresAtMs) && expiresAtMs > now.getTime();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateBoundedPositiveSafeInteger(value: number, max: number, message: string): number {
  if (!Number.isSafeInteger(value) || value <= 0 || value > max) {
    throw new Error(message);
  }

  return value;
}

class WindowsInputOutputError extends Error {}
