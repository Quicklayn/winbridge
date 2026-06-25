import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  formatMvpNativePreflightError,
  formatMvpNativePreflightJsonResult,
  formatMvpNativePreflightResult,
  MvpNativePreflightUsageError,
  MVP_NATIVE_PREFLIGHT_POWERSHELL_SCRIPTS,
  parseMvpNativePreflightArgs,
  runMvpNativePreflightCheck,
  validatePowerShellProbeSuccessOutput
} from "./mvp-native-preflight.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(scriptDirectory, "mvp-native-preflight.mjs");

describe("MVP native preflight", () => {
  it("parses help and rejects unknown arguments without echoing values", () => {
    expect(parseMvpNativePreflightArgs([])).toEqual({ help: false, json: false });
    expect(parseMvpNativePreflightArgs(["--help"])).toEqual({ help: true });
    expect(parseMvpNativePreflightArgs(["--json"])).toEqual({ help: false, json: true });

    let thrown: unknown;
    try {
      parseMvpNativePreflightArgs(["--token", "raw-secret-token"]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(MvpNativePreflightUsageError);
    expect(formatMvpNativePreflightError(thrown)).not.toContain("raw-secret-token");
    expect(() => parseMvpNativePreflightArgs(["--json", "raw-secret-token"])).toThrow(
      MvpNativePreflightUsageError
    );
  });

  it("passes when all read-only Windows prerequisite checks pass", async () => {
    const calls: Array<{ script: string; name: string }> = [];
    const result = await runMvpNativePreflightCheck({
      platform: "win32",
      runPowerShell: async (script: string, name: string) => {
        calls.push({ script, name });
        return "{\"ok\":true}";
      }
    });

    expect(result.ok).toBe(true);
    expect(calls.map((call) => call.name)).toEqual([
      "powershell",
      "capture-prerequisites",
      "input-prerequisites"
    ]);
    expect(formatMvpNativePreflightResult(result)).toBe(
      [
        "WinBridge MVP native preflight passed.",
        "platform=windows",
        "powershell=ok",
        "capture-prerequisites=ok",
        "input-prerequisites=ok",
        "safety=read-only-no-capture-no-input"
      ].join("\n")
    );
  });

  it("formats bounded JSON readiness output", async () => {
    const result = await runMvpNativePreflightCheck({
      platform: "win32",
      runPowerShell: async () => "{\"ok\":true}"
    });
    const parsed = JSON.parse(formatMvpNativePreflightJsonResult(result));

    expect(parsed).toEqual({
      ok: true,
      checks: [
        { name: "platform", ok: true },
        { name: "powershell", ok: true },
        { name: "capture-prerequisites", ok: true },
        { name: "input-prerequisites", ok: true }
      ]
    });
  });

  it("fails closed on unsupported platform before PowerShell", async () => {
    const calls: string[] = [];
    const result = await runMvpNativePreflightCheck({
      platform: "linux",
      runPowerShell: async (_script: string, name: string) => {
        calls.push(name);
      }
    });

    expect(result).toMatchObject({ ok: false, reason: "unsupported-platform" });
    expect(calls).toEqual([]);
    expect(formatMvpNativePreflightResult(result)).toBe(
      "WinBridge MVP native preflight failed. reason=unsupported-platform"
    );
  });

  it("fails closed with bounded reason codes without raw PowerShell output", async () => {
    const result = await runMvpNativePreflightCheck({
      platform: "win32",
      runPowerShell: async (_script: string, name: string) => {
        if (name === "capture-prerequisites") {
          throw new Error("raw-screen-path C:\\Users\\Nur\\secret 123-456 token");
        }
        return "{\"ok\":true}";
      }
    });
    const output = formatMvpNativePreflightResult(result);

    expect(result).toMatchObject({ ok: false, reason: "capture-prerequisite-unavailable" });
    expect(output).toBe(
      "WinBridge MVP native preflight failed. reason=capture-prerequisite-unavailable"
    );
    expect(output).not.toContain("raw-screen-path");
    expect(output).not.toContain("C:\\Users\\Nur\\secret");
    expect(output).not.toContain("123-456");
    expect(output).not.toContain("token");
  });

  it("formats bounded JSON failure output without raw PowerShell leakage", async () => {
    const result = await runMvpNativePreflightCheck({
      platform: "win32",
      runPowerShell: async (_script: string, name: string) => {
        if (name === "input-prerequisites") {
          throw new Error("raw-key-data C:\\Users\\Nur\\secret 123-456 token");
        }
        return "{\"ok\":true}";
      }
    });
    const output = formatMvpNativePreflightJsonResult(result);
    const parsed = JSON.parse(output);

    expect(parsed.ok).toBe(false);
    expect(parsed.reason).toBe("input-prerequisite-unavailable");
    expect(parsed.checks.at(-1)).toEqual({
      name: "input-prerequisites",
      ok: false,
      reason: "input-prerequisite-unavailable"
    });
    expect(output).not.toContain("raw-key-data");
    expect(output).not.toContain("C:\\Users\\Nur\\secret");
    expect(output).not.toContain("123-456");
    expect(output).not.toContain("token");
  });

  it("keeps fixed PowerShell scripts read-only and side-effect constrained", () => {
    const scripts = Object.values(MVP_NATIVE_PREFLIGHT_POWERSHELL_SCRIPTS).join("\n");
    const source = readFileSync(scriptPath, "utf8");

    expect(scripts).not.toContain("CopyFromScreen");
    expect(scripts).not.toMatch(/\bSendInput\s*\(/);
    expect(scripts).not.toMatch(/New-Object\s+WinBridgeInput|INPUT\[\]|ToArray\(/);
    expect(scripts).not.toMatch(/ExecutionPolicy|Bypass|Invoke-Expression|Start-Process/);
    expect(scripts).not.toMatch(/TcpClient|UdpClient|HttpListener|WebSocket|Socket/);
    expect(scripts).not.toMatch(/New-Service|Set-Service|Register-ScheduledTask|Run\\CurrentVersion/);
    expect(scripts).not.toMatch(/Set-Content|Out-File|Add-Content|Export-/);
    expect(source).not.toContain("node:net");
    expect(source).not.toContain("node:http");
    expect(source).not.toContain("node:https");
    expect(source).not.toContain("node:fs");
  });

  it("accepts only the strict bounded PowerShell probe success marker", () => {
    expect(() => validatePowerShellProbeSuccessOutput("{\"ok\":true}")).not.toThrow();
    expect(() => validatePowerShellProbeSuccessOutput(" \n{\"ok\":true}\r\n ")).not.toThrow();

    for (const output of [
      "",
      "not-json",
      "[]",
      "null",
      "true",
      "{\"ok\":false}",
      "{\"ok\":true,\"path\":\"C:\\\\Users\\\\Nur\\\\secret\"}",
      "{\"status\":\"ok\"}",
      "{\"ok\":true}\n{\"ok\":true}",
      `{"ok":true,"padding":"${"x".repeat(1100)}"}`
    ]) {
      expect(() => validatePowerShellProbeSuccessOutput(output)).toThrow(
        "invalid-native-preflight-output"
      );
    }
  });

  it("fails closed when a successful PowerShell probe emits malformed readiness output", async () => {
    const result = await runMvpNativePreflightCheck({
      platform: "win32",
      runPowerShell: async (_script: string, name: string) => {
        if (name === "capture-prerequisites") {
          return "{\"ok\":true,\"path\":\"C:\\\\Users\\\\Nur\\\\secret\",\"token\":\"raw-token\"}";
        }
        return "{\"ok\":true}";
      }
    });
    const textOutput = formatMvpNativePreflightResult(result);
    const jsonOutput = formatMvpNativePreflightJsonResult(result);

    expect(result).toMatchObject({
      ok: false,
      reason: "capture-prerequisite-unavailable"
    });
    expect(textOutput).toBe(
      "WinBridge MVP native preflight failed. reason=capture-prerequisite-unavailable"
    );
    expect(JSON.parse(jsonOutput)).toMatchObject({
      ok: false,
      reason: "capture-prerequisite-unavailable"
    });
    for (const output of [textOutput, jsonOutput]) {
      expect(output).not.toContain("C:\\Users\\Nur\\secret");
      expect(output).not.toContain("raw-token");
      expect(output).not.toContain("path");
    }
  });
});
