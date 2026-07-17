import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { Buffer } from "node:buffer";
import { stringifyJson } from "@winbridge/protocol";
import type { WindowsInputNativeRequest } from "./index.js";

export const DEFAULT_WINDOWS_INPUT_WORKER_MAX_REQUEST_BYTES = 4096;
export const DEFAULT_WINDOWS_INPUT_WORKER_MAX_RESPONSE_BYTES = 512;
export const WINDOWS_INPUT_WORKER_ERROR_MESSAGE = "Windows input worker failed";

export type WindowsInputNativeWorker = Readonly<{
  run(request: WindowsInputNativeRequest): Promise<string>;
  close(): void;
}>;

export type WindowsInputNativeWorkerFactory = () => WindowsInputNativeWorker;

export type WindowsInputWorkerProcessFactory = () => ChildProcessWithoutNullStreams;

export type PowerShellWindowsInputWorkerOptions = Readonly<{
  processFactory?: WindowsInputWorkerProcessFactory;
  maxRequestBytes?: number;
  maxResponseBytes?: number;
}>;

type PendingWorkerRequest = {
  requestId: number;
  timer: ReturnType<typeof setTimeout>;
  resolve(output: string): void;
  reject(error: Error): void;
};

type WindowsInputWorkerEvent =
  | Readonly<{
      kind: "pointer-move";
      xAbsolute: number;
      yAbsolute: number;
    }>
  | Readonly<{
      kind: "pointer-down" | "pointer-up";
      xAbsolute: number;
      yAbsolute: number;
      button: "primary" | "secondary" | "middle" | "back" | "forward";
    }>
  | Readonly<{
      kind: "pointer-wheel";
      xAbsolute: number;
      yAbsolute: number;
      deltaX: number;
      deltaY: number;
    }>
  | Readonly<{
      kind: "key-down" | "key-up";
      virtualKey: number;
      modifiers: readonly Readonly<{ virtualKey: number }>[];
    }>;

const MAX_WINDOWS_INPUT_WORKER_TIMEOUT_MS = 2_147_483_647;
const ABSOLUTE_POINTER_RANGE = 65_535;
const POINTER_WHEEL_DELTA_UNIT = 120;
const MAX_POINTER_WHEEL_DELTA = 4096 * POINTER_WHEEL_DELTA_UNIT;
const POINTER_BUTTONS = new Set(["primary", "secondary", "middle", "back", "forward"]);
const MODIFIER_VIRTUAL_KEYS = new Map<string, number>([
  ["alt", 0x12],
  ["control", 0x11],
  ["meta", 0x5b],
  ["shift", 0x10]
]);
const FIXED_KEY_VIRTUAL_KEYS = new Map<string, number>([
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

const POWERSHELL_WINDOWS_INPUT_WORKER_SCRIPT = `
$ErrorActionPreference = "Stop"
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class WinBridgeInputWorker {
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
  $input = New-Object WinBridgeInputWorker+INPUT
  $input.type = 0
  $input.U.mi.dx = $dx
  $input.U.mi.dy = $dy
  $input.U.mi.mouseData = $mouseData
  $input.U.mi.dwFlags = $flags
  return $input
}
function New-KeyboardInput([uint16]$vk, [uint32]$flags) {
  $input = New-Object WinBridgeInputWorker+INPUT
  $input.type = 1
  $input.U.ki.wVk = $vk
  $input.U.ki.dwFlags = $flags
  return $input
}
function Add-Input([System.Collections.Generic.List[WinBridgeInputWorker+INPUT]]$inputs, [WinBridgeInputWorker+INPUT]$input) {
  $inputs.Add($input) | Out-Null
}
function Convert-ToDword([int]$value) {
  return [BitConverter]::ToUInt32([BitConverter]::GetBytes([int]$value), 0)
}
function Invoke-WinBridgeInput($event) {
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
  $inputs = New-Object 'System.Collections.Generic.List[WinBridgeInputWorker+INPUT]'
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
        default { throw "Unsupported pointer button" }
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
        default { throw "Unsupported pointer button" }
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
    default { throw "Unsupported input kind" }
  }
  if ($inputs.Count -lt 1) { throw "No input events" }
  $array = $inputs.ToArray()
  $sent = [WinBridgeInputWorker]::SendInput([uint32]$array.Length, $array, [Runtime.InteropServices.Marshal]::SizeOf([type][WinBridgeInputWorker+INPUT]))
  if ($sent -ne $array.Length) { throw "SendInput failed" }
}
while ($null -ne ($line = [Console]::In.ReadLine())) {
  $requestId = 0
  $applied = $false
  try {
    $request = $line | ConvertFrom-Json
    $requestId = [long]$request.requestId
    if ($requestId -lt 1) { throw "Invalid request id" }
    Invoke-WinBridgeInput $request.event
    $applied = $true
  } catch {
    $applied = $false
  }
  [Console]::Out.WriteLine(([ordered]@{ requestId = $requestId; applied = $applied } | ConvertTo-Json -Compress))
  [Console]::Out.Flush()
}
`;

export function createPowerShellWindowsInputWorkerCommand(): readonly string[] {
  return ["-NoProfile", "-NonInteractive", "-Command", POWERSHELL_WINDOWS_INPUT_WORKER_SCRIPT];
}

export function createPowerShellWindowsInputWorker(
  options: PowerShellWindowsInputWorkerOptions = {}
): WindowsInputNativeWorker {
  const maxRequestBytes = validateBoundedPositiveSafeInteger(
    options.maxRequestBytes ?? DEFAULT_WINDOWS_INPUT_WORKER_MAX_REQUEST_BYTES,
    DEFAULT_WINDOWS_INPUT_WORKER_MAX_REQUEST_BYTES
  );
  const maxResponseBytes = validateBoundedPositiveSafeInteger(
    options.maxResponseBytes ?? DEFAULT_WINDOWS_INPUT_WORKER_MAX_RESPONSE_BYTES,
    DEFAULT_WINDOWS_INPUT_WORKER_MAX_RESPONSE_BYTES
  );
  const processFactory = options.processFactory ?? defaultWindowsInputWorkerProcessFactory;
  const child = processFactory();
  let closed = false;
  let nextRequestId = 1;
  let stdoutBuffer = "";
  let pending: PendingWorkerRequest | undefined;

  child.stdout.setEncoding("utf8");
  child.stderr.on("data", () => failWorker());
  child.stdout.on("data", (chunk: string) => handleStdoutData(chunk));
  child.once("error", () => failWorker());
  child.once("exit", () => failWorker());

  function failWorker(): void {
    if (closed) {
      return;
    }

    closed = true;
    const active = pending;
    pending = undefined;
    if (active) {
      clearTimeout(active.timer);
      active.reject(new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE));
    }
    terminateChild(child);
  }

  function handleStdoutData(chunk: string): void {
    if (closed) {
      return;
    }

    stdoutBuffer += chunk;
    if (Buffer.byteLength(stdoutBuffer, "utf8") > maxResponseBytes) {
      failWorker();
      return;
    }

    const newlineIndex = stdoutBuffer.indexOf("\n");
    if (newlineIndex < 0) {
      return;
    }

    const line = stdoutBuffer.slice(0, newlineIndex).replace(/\r$/, "");
    const remainder = stdoutBuffer.slice(newlineIndex + 1);
    stdoutBuffer = "";
    const active = pending;
    if (!active || remainder.trim().length > 0 || !isAcceptedWorkerResponse(line, active.requestId)) {
      failWorker();
      return;
    }

    pending = undefined;
    clearTimeout(active.timer);
    active.resolve("{\"applied\":true}");
  }

  return {
    run(request) {
      if (closed || pending) {
        return Promise.reject(new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE));
      }

      let parsedRequest: Readonly<{ timeoutMs: number; event: WindowsInputWorkerEvent }>;
      try {
        parsedRequest = parseWindowsInputWorkerRequest(request);
      } catch {
        failWorker();
        return Promise.reject(new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE));
      }

      const requestId = nextRequestId;
      nextRequestId += 1;
      const payload = stringifyJson({ requestId, event: parsedRequest.event });
      if (Buffer.byteLength(payload, "utf8") > maxRequestBytes) {
        failWorker();
        return Promise.reject(new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE));
      }

      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => failWorker(), parsedRequest.timeoutMs);
        pending = { requestId, timer, resolve, reject };
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

function parseWindowsInputWorkerRequest(
  request: unknown
): Readonly<{ timeoutMs: number; event: WindowsInputWorkerEvent }> {
  if (
    !isRecord(request) ||
    !hasExactKeys(request, ["timeoutMs", "event"]) ||
    !isBoundedInteger(request.timeoutMs, 1, MAX_WINDOWS_INPUT_WORKER_TIMEOUT_MS)
  ) {
    throw new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
  }

  return {
    timeoutMs: request.timeoutMs,
    event: parseWindowsInputWorkerEvent(request.event)
  };
}

function parseWindowsInputWorkerEvent(value: unknown): WindowsInputWorkerEvent {
  if (!isRecord(value) || typeof value.kind !== "string") {
    throw new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
  }

  switch (value.kind) {
    case "pointer-move":
      assertExactPointerEvent(value, ["kind", "x", "y", "xAbsolute", "yAbsolute"], ["buttons"]);
      assertOptionalPointerButtons(value.buttons);
      return {
        kind: value.kind,
        xAbsolute: value.xAbsolute,
        yAbsolute: value.yAbsolute
      };
    case "pointer-down":
    case "pointer-up":
      assertExactPointerEvent(
        value,
        ["kind", "x", "y", "xAbsolute", "yAbsolute", "button"],
        ["buttons"]
      );
      if (typeof value.button !== "string" || !POINTER_BUTTONS.has(value.button)) {
        throw new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
      }
      assertOptionalPointerButtons(value.buttons);
      return {
        kind: value.kind,
        xAbsolute: value.xAbsolute,
        yAbsolute: value.yAbsolute,
        button: value.button as "primary" | "secondary" | "middle" | "back" | "forward"
      };
    case "pointer-wheel":
      assertExactPointerEvent(
        value,
        ["kind", "x", "y", "xAbsolute", "yAbsolute", "deltaX", "deltaY"]
      );
      if (
        !isNormalizedWheelDelta(value.deltaX) ||
        !isNormalizedWheelDelta(value.deltaY) ||
        (value.deltaX === 0 && value.deltaY === 0)
      ) {
        throw new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
      }
      return {
        kind: value.kind,
        xAbsolute: value.xAbsolute,
        yAbsolute: value.yAbsolute,
        deltaX: value.deltaX,
        deltaY: value.deltaY
      };
    case "key-down":
    case "key-up":
      return parseWindowsInputWorkerKeyboardEvent(
        value as Record<string, unknown> & { kind: "key-down" | "key-up" }
      );
    default:
      throw new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
  }
}

function assertExactPointerEvent(
  value: Record<string, unknown>,
  requiredKeys: readonly string[],
  optionalKeys: readonly string[] = []
): asserts value is Record<string, unknown> & {
  x: number;
  y: number;
  xAbsolute: number;
  yAbsolute: number;
} {
  if (
    !hasExactKeys(value, requiredKeys, optionalKeys) ||
    !isBoundedNumber(value.x, 0, 1) ||
    !isBoundedNumber(value.y, 0, 1) ||
    !isBoundedInteger(value.xAbsolute, 0, ABSOLUTE_POINTER_RANGE) ||
    !isBoundedInteger(value.yAbsolute, 0, ABSOLUTE_POINTER_RANGE) ||
    value.xAbsolute !== Math.round(value.x * ABSOLUTE_POINTER_RANGE) ||
    value.yAbsolute !== Math.round(value.y * ABSOLUTE_POINTER_RANGE)
  ) {
    throw new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
  }
}

function assertOptionalPointerButtons(value: unknown): void {
  if (value !== undefined && !isBoundedInteger(value, 0, 31)) {
    throw new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
  }
}

function parseWindowsInputWorkerKeyboardEvent(
  value: Record<string, unknown> & { kind: "key-down" | "key-up" }
): WindowsInputWorkerEvent {
  const expectedVirtualKey =
    typeof value.key === "string" ? virtualKeyForWorkerKey(value.key) : undefined;
  if (
    !hasExactKeys(value, ["kind", "key", "virtualKey", "modifiers"], ["code"]) ||
    expectedVirtualKey === undefined ||
    expectedVirtualKey !== value.virtualKey ||
    (value.code !== undefined &&
      (typeof value.code !== "string" || virtualKeyForWorkerKey(value.code) === undefined)) ||
    !Array.isArray(value.modifiers) ||
    value.modifiers.length > 4
  ) {
    throw new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
  }

  const seenModifiers = new Set<string>();
  const modifiers = value.modifiers.map((modifier) => {
    const modifierName = isRecord(modifier) ? modifier.modifier : undefined;
    const expectedModifierVirtualKey =
      typeof modifierName === "string" ? MODIFIER_VIRTUAL_KEYS.get(modifierName) : undefined;
    if (
      !isRecord(modifier) ||
      !hasExactKeys(modifier, ["modifier", "virtualKey"]) ||
      typeof modifierName !== "string" ||
      seenModifiers.has(modifierName) ||
      expectedModifierVirtualKey === undefined ||
      expectedModifierVirtualKey !== modifier.virtualKey
    ) {
      throw new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
    }

    seenModifiers.add(modifierName);
    return { virtualKey: expectedModifierVirtualKey };
  });

  return {
    kind: value.kind,
    virtualKey: expectedVirtualKey,
    modifiers
  };
}

function virtualKeyForWorkerKey(key: string): number | undefined {
  const fixed = FIXED_KEY_VIRTUAL_KEYS.get(key);
  if (fixed !== undefined) {
    return fixed;
  }

  const letter = /^Key([A-Z])$/.exec(key);
  if (letter?.[1]) {
    return letter[1].charCodeAt(0);
  }

  const digit = /^Digit([0-9])$/.exec(key);
  if (digit?.[1]) {
    return 0x30 + Number(digit[1]);
  }

  const numpad = /^Numpad([0-9])$/.exec(key);
  if (numpad?.[1]) {
    return 0x60 + Number(numpad[1]);
  }

  const functionKey = /^F([1-9]|1[0-9]|2[0-4])$/.exec(key);
  if (functionKey?.[1]) {
    return 0x70 + Number(functionKey[1]) - 1;
  }

  return undefined;
}

function isNormalizedWheelDelta(value: unknown): value is number {
  return (
    isBoundedInteger(value, -MAX_POINTER_WHEEL_DELTA, MAX_POINTER_WHEEL_DELTA) &&
    value % POINTER_WHEEL_DELTA_UNIT === 0
  );
}

function hasExactKeys(
  value: Record<string, unknown>,
  requiredKeys: readonly string[],
  optionalKeys: readonly string[] = []
): boolean {
  const allowedKeys = new Set([...requiredKeys, ...optionalKeys]);
  return (
    requiredKeys.every((key) => Object.hasOwn(value, key)) &&
    Object.keys(value).every((key) => allowedKeys.has(key))
  );
}

function isBoundedNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isBoundedInteger(value: unknown, min: number, max: number): value is number {
  return Number.isSafeInteger(value) && (value as number) >= min && (value as number) <= max;
}

function defaultWindowsInputWorkerProcessFactory(): ChildProcessWithoutNullStreams {
  return spawn("powershell.exe", [...createPowerShellWindowsInputWorkerCommand()], {
    detached: false,
    stdio: "pipe",
    windowsHide: true
  });
}

function isAcceptedWorkerResponse(line: string, requestId: number): boolean {
  try {
    const parsed: unknown = JSON.parse(line);
    if (!isRecord(parsed) || Object.keys(parsed).length !== 2) {
      return false;
    }

    return parsed.requestId === requestId && parsed.applied === true;
  } catch {
    return false;
  }
}

function terminateChild(child: ChildProcessWithoutNullStreams): void {
  try {
    child.stdin.destroy();
  } catch {
    // Shutdown is best-effort and must not expose native diagnostics.
  }

  try {
    child.kill();
  } catch {
    // Shutdown is best-effort and must not block authorization loss.
  }
}

function validateBoundedPositiveSafeInteger(value: number, max: number): number {
  if (!Number.isSafeInteger(value) || value <= 0 || value > max) {
    throw new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
