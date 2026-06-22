import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

export const MVP_NATIVE_PREFLIGHT_USAGE = [
  "Usage: npm run mvp:native-preflight",
  "",
  "Checks local Windows native prerequisites without starting relay, host,",
  "viewer, browser, capture, input, services, startup persistence, or",
  "unattended access."
].join("\n");

export const MVP_NATIVE_PREFLIGHT_REASON_CODES = Object.freeze([
  "unsupported-platform",
  "powershell-unavailable",
  "capture-prerequisite-unavailable",
  "input-prerequisite-unavailable"
]);

export const MVP_NATIVE_PREFLIGHT_POWERSHELL_SCRIPTS = Object.freeze({
  powershell: `
$ErrorActionPreference = "Stop"
[void]$PSVersionTable.PSVersion
[pscustomobject]@{ ok = $true } | ConvertTo-Json -Compress
`,
  capturePrerequisites: `
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[void][System.Windows.Forms.Screen]
[void][System.Drawing.Bitmap]
[pscustomobject]@{ ok = $true } | ConvertTo-Json -Compress
`,
  inputPrerequisites: `
$ErrorActionPreference = "Stop"
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class WinBridgeInputPreflight {
  [DllImport("user32.dll", SetLastError=true, EntryPoint="SendInput")]
  public static extern uint NativeSendInput(uint nInputs, IntPtr pInputs, int cbSize);
}
"@
[void][WinBridgeInputPreflight]
[pscustomobject]@{ ok = $true } | ConvertTo-Json -Compress
`
});

const CHECKS = Object.freeze([
  {
    name: "powershell",
    reason: "powershell-unavailable",
    script: MVP_NATIVE_PREFLIGHT_POWERSHELL_SCRIPTS.powershell
  },
  {
    name: "capture-prerequisites",
    reason: "capture-prerequisite-unavailable",
    script: MVP_NATIVE_PREFLIGHT_POWERSHELL_SCRIPTS.capturePrerequisites
  },
  {
    name: "input-prerequisites",
    reason: "input-prerequisite-unavailable",
    script: MVP_NATIVE_PREFLIGHT_POWERSHELL_SCRIPTS.inputPrerequisites
  }
]);
const DEFAULT_TIMEOUT_MS = 5_000;
const MAX_OUTPUT_BYTES = 1024;

export class MvpNativePreflightUsageError extends Error {
  constructor() {
    super(MVP_NATIVE_PREFLIGHT_USAGE);
    this.name = "MvpNativePreflightUsageError";
  }
}

export function parseMvpNativePreflightArgs(rawArgs) {
  if (rawArgs.length === 0) {
    return { help: false, json: false };
  }
  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }
  if (rawArgs.length === 1 && rawArgs[0] === "--json") {
    return { help: false, json: true };
  }
  throw new MvpNativePreflightUsageError();
}

export async function runMvpNativePreflightCheck(options = {}) {
  const platform = options.platform ?? process.platform;
  const runPowerShell = options.runPowerShell ?? runPowerShellPreflightScript;

  if (platform !== "win32") {
    return {
      ok: false,
      reason: "unsupported-platform",
      checks: [{ name: "platform", ok: false, reason: "unsupported-platform" }]
    };
  }

  const checks = [{ name: "platform", ok: true }];
  for (const check of CHECKS) {
    try {
      await runPowerShell(check.script, check.name);
      checks.push({ name: check.name, ok: true });
    } catch {
      checks.push({ name: check.name, ok: false, reason: check.reason });
      return { ok: false, reason: check.reason, checks };
    }
  }

  return { ok: true, checks };
}

export function formatMvpNativePreflightResult(result) {
  if (result.ok) {
    return [
      "WinBridge MVP native preflight passed.",
      "platform=windows",
      "powershell=ok",
      "capture-prerequisites=ok",
      "input-prerequisites=ok",
      "safety=read-only-no-capture-no-input"
    ].join("\n");
  }

  const reason = safeNativePreflightReason(result.reason);
  return `WinBridge MVP native preflight failed. reason=${reason}`;
}

export function formatMvpNativePreflightJsonResult(result) {
  return JSON.stringify({
    ok: result.ok === true,
    ...(result.ok ? {} : { reason: safeNativePreflightReason(result.reason) }),
    checks: result.checks.map((check) => ({
      name: check.name,
      ok: check.ok === true,
      ...(check.ok ? {} : { reason: safeNativePreflightReason(check.reason) })
    }))
  });
}

export function formatMvpNativePreflightError(error) {
  if (error instanceof MvpNativePreflightUsageError) {
    return MVP_NATIVE_PREFLIGHT_USAGE;
  }
  return "WinBridge MVP native preflight failed. reason=powershell-unavailable";
}

function runPowerShellPreflightScript(script) {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      {
        timeout: DEFAULT_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT_BYTES,
        windowsHide: false
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}

function safeNativePreflightReason(reason) {
  return MVP_NATIVE_PREFLIGHT_REASON_CODES.includes(reason)
    ? reason
    : "powershell-unavailable";
}

async function runCli(rawArgs = process.argv.slice(2), streams = process) {
  try {
    const parsed = parseMvpNativePreflightArgs(rawArgs);
    if (parsed.help) {
      streams.stdout.write(`${MVP_NATIVE_PREFLIGHT_USAGE}\n`);
      return 0;
    }

    const result = await runMvpNativePreflightCheck();
    const output = parsed.json
      ? formatMvpNativePreflightJsonResult(result)
      : formatMvpNativePreflightResult(result);
    const stream = result.ok ? streams.stdout : streams.stderr;
    stream.write(`${output}\n`);
    return result.ok ? 0 : 1;
  } catch (error) {
    streams.stderr.write(`${formatMvpNativePreflightError(error)}\n`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = await runCli();
}
