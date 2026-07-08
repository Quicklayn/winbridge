import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  formatMvpDoctorError,
  formatMvpDoctorJsonResult,
  formatMvpDoctorResult,
  isSupportedNodeVersion,
  MvpDoctorUsageError,
  parseMvpDoctorArgs,
  REQUIRED_MVP_ENTRYPOINT_FILES,
  REQUIRED_MVP_ROOT_SCRIPTS,
  REQUIRED_MVP_WORKSPACE_PACKAGES,
  runMvpDoctorCheck
} from "./mvp-doctor.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(scriptDirectory, "mvp-doctor.mjs");

describe("MVP doctor", () => {
  it("parses help and rejects unknown arguments without echoing values", () => {
    expect(parseMvpDoctorArgs([])).toEqual({ help: false, json: false });
    expect(parseMvpDoctorArgs(["--help"])).toEqual({ help: true });
    expect(parseMvpDoctorArgs(["--json"])).toEqual({ help: false, json: true });

    let thrown: unknown;
    try {
      parseMvpDoctorArgs(["--token", "raw-secret-token"]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(MvpDoctorUsageError);
    expect(formatMvpDoctorError(thrown)).not.toContain("raw-secret-token");
    expect(() => parseMvpDoctorArgs(["--json", "raw-secret-token"])).toThrow(
      MvpDoctorUsageError
    );
  });

  it("passes with Windows, supported Node, required scripts, and workspace manifests", () => {
    const result = runMvpDoctorCheck(createDoctorOptions());

    expect(result.ok).toBe(true);
    expect(formatMvpDoctorResult(result)).toBe(
      [
        "WinBridge MVP doctor passed.",
        "platform=windows",
        "node=ok",
        "scripts=ok",
        "workspaces=ok",
        "entrypoints=ok",
        "safety=visible-consent-required"
      ].join("\n")
    );
  });

  it("requires critical agent-shell MVP module entrypoints", () => {
    expect(REQUIRED_MVP_ENTRYPOINT_FILES).toEqual(
      expect.arrayContaining([
        "apps/agent-shell/src/cli-shutdown.ts",
        "apps/agent-shell/src/host-control-prompt.ts",
        "apps/agent-shell/src/host-local-control-surface.ts",
        "apps/agent-shell/src/screen-frame-output.ts",
        "apps/agent-shell/src/viewer-control-prompt.ts",
        "apps/agent-shell/src/viewer-local-control-surface.ts",
        "scripts/mvp-audit-summary.mjs",
        "scripts/mvp-trial.mjs"
      ])
    );
  });

  it("formats bounded JSON readiness output", () => {
    const result = runMvpDoctorCheck(createDoctorOptions());
    const parsed = JSON.parse(formatMvpDoctorJsonResult(result));

    expect(parsed).toEqual({
      ok: true,
      checks: [
        { name: "platform", ok: true },
        { name: "node", ok: true },
        { name: "scripts", ok: true },
        { name: "workspaces", ok: true },
        { name: "entrypoints", ok: true }
      ]
    });
  });

  it("fails closed with fixed reason codes without raw paths or secrets", () => {
    const result = runMvpDoctorCheck(createDoctorOptions({
      platform: "linux",
      rootDir: "C:\\Users\\Nur\\secret-project"
    }));
    const output = formatMvpDoctorResult(result);

    expect(result.ok).toBe(false);
    expect(output).toBe("WinBridge MVP doctor failed. reason=unsupported-platform");
    expect(output).not.toContain("C:\\Users\\Nur\\secret-project");
    expect(output).not.toContain("secret");
  });

  it("formats bounded JSON failure output without raw paths or secrets", () => {
    const secretRoot = "C:\\Users\\Nur\\secret-json-project";
    const result = runMvpDoctorCheck(createDoctorOptions({
      platform: "linux",
      rootDir: secretRoot
    }));
    const output = formatMvpDoctorJsonResult(result);
    const parsed = JSON.parse(output);

    expect(parsed.ok).toBe(false);
    expect(parsed.reason).toBe("unsupported-platform");
    expect(parsed.checks[0]).toEqual({
      name: "platform",
      ok: false,
      reason: "unsupported-platform"
    });
    expect(parsed.checks.map((check: { name: string }) => check.name)).toEqual([
      "platform",
      "node",
      "scripts",
      "workspaces",
      "entrypoints"
    ]);
    expect(output).not.toContain(secretRoot);
    expect(output).not.toContain("secret");
  });

  it("detects unsupported Node and missing project prerequisites", () => {
    expect(runMvpDoctorCheck(createDoctorOptions({ nodeVersion: "20.18.9" }))).toMatchObject({
      ok: false,
      reason: "unsupported-node"
    });

    expect(
      runMvpDoctorCheck(createDoctorOptions({
        packageJson: { scripts: { "dev:relay": "node relay" } }
      }))
    ).toMatchObject({ ok: false, reason: "missing-root-script" });

    expect(
      runMvpDoctorCheck(createDoctorOptions({
        packageJson: {
          scripts: {
            ...alignedRootScripts(),
            "dev:agent":
              "npm --workspace @winbridge/protocol run build && npm --workspace @winbridge/agent-shell run dev -- --token raw-secret-token"
          }
        }
      }))
    ).toMatchObject({ ok: false, reason: "script-misaligned" });

    expect(
      runMvpDoctorCheck(createDoctorOptions({
        exists: (path: string) => !path.includes("windows-input")
      }))
    ).toMatchObject({ ok: false, reason: "missing-workspace-manifest" });
  });

  it("detects missing static entrypoints without echoing paths or secrets", () => {
    const secretRoot = "C:\\Users\\Nur\\secret-entrypoint-project";
    const result = runMvpDoctorCheck(createDoctorOptions({
      rootDir: secretRoot,
      exists: (path: string) => {
        if (path.endsWith("apps\\relay\\src\\index.ts")) {
          return false;
        }
        return path.endsWith("\\package.json") || path.endsWith("\\src\\index.ts");
      }
    }));
    const output = formatMvpDoctorResult(result);

    expect(result).toMatchObject({ ok: false, reason: "missing-entrypoint" });
    expect(output).toBe("WinBridge MVP doctor failed. reason=missing-entrypoint");
    expect(output).not.toContain(secretRoot);
    expect(output).not.toContain("apps\\relay\\src\\index.ts");
    expect(output).not.toContain("secret");
  });

  it("detects misaligned root scripts without echoing script bodies or secrets", () => {
    const secretScript =
      "npm run build && node scripts/mvp-session-smoke.mjs --token raw-secret-token --pairing 123-456";
    const result = runMvpDoctorCheck(createDoctorOptions({
      packageJson: {
        scripts: {
          ...alignedRootScripts(),
          "mvp:smoke": "node scripts/mvp-session-smoke.mjs"
        }
      }
    }));
    const secretResult = runMvpDoctorCheck(createDoctorOptions({
      packageJson: {
        scripts: {
          ...alignedRootScripts(),
          "dev:relay": secretScript
        }
      }
    }));
    const output = formatMvpDoctorResult(secretResult);
    const jsonOutput = formatMvpDoctorJsonResult(secretResult);

    expect(result).toMatchObject({ ok: false, reason: "script-misaligned" });
    expect(secretResult).toMatchObject({ ok: false, reason: "script-misaligned" });
    expect(output).toBe("WinBridge MVP doctor failed. reason=script-misaligned");
    expect(jsonOutput).toContain('"reason":"script-misaligned"');
    for (const unsafe of [
      secretScript,
      "raw-secret-token",
      "123-456",
      "node scripts/mvp-session-smoke.mjs"
    ]) {
      expect(output).not.toContain(unsafe);
      expect(jsonOutput).not.toContain(unsafe);
    }
  });

  it("requires ordered root script alignment for relay, agent, and smoke workflows", () => {
    const scripts = alignedRootScripts();

    expect(runMvpDoctorCheck(createDoctorOptions({ packageJson: { scripts } }))).toMatchObject({
      ok: true
    });
    expect(
      runMvpDoctorCheck(createDoctorOptions({
        packageJson: {
          scripts: {
            ...scripts,
            "dev:relay":
              "npm --workspace @winbridge/relay run dev && npm --workspace @winbridge/protocol run build && npm --workspace @winbridge/audit-log run build"
          }
        }
      }))
    ).toMatchObject({ ok: false, reason: "script-misaligned" });
    expect(
      runMvpDoctorCheck(createDoctorOptions({
        packageJson: {
          scripts: {
            ...scripts,
            "mvp:smoke": "node scripts/mvp-session-smoke.mjs && npm run build"
          }
        }
      }))
    ).toMatchObject({ ok: false, reason: "script-misaligned" });
  });

  it("detects missing root helper script entrypoints without echoing paths", () => {
    const secretRoot = "C:\\Users\\Nur\\secret-helper-project";
    const result = runMvpDoctorCheck(createDoctorOptions({
      rootDir: secretRoot,
      exists: (path: string) => {
        if (path.endsWith("scripts\\mvp-native-preflight.mjs")) {
          return false;
        }
        return (
          path.endsWith("\\package.json") ||
          REQUIRED_MVP_ENTRYPOINT_FILES.some((entrypointPath) =>
            path.endsWith(entrypointPath.replaceAll("/", "\\"))
          )
        );
      }
    }));
    const output = formatMvpDoctorResult(result);

    expect(result).toMatchObject({ ok: false, reason: "missing-entrypoint" });
    expect(output).toBe("WinBridge MVP doctor failed. reason=missing-entrypoint");
    expect(output).not.toContain(secretRoot);
    expect(output).not.toContain("scripts\\mvp-native-preflight.mjs");
    expect(output).not.toContain("secret");
  });

  it("detects missing critical agent-shell modules without echoing paths", () => {
    const secretRoot = "C:\\Users\\Nur\\secret-agent-entrypoint-project";
    const missingModule = "apps\\agent-shell\\src\\viewer-local-control-surface.ts";
    const result = runMvpDoctorCheck(createDoctorOptions({
      rootDir: secretRoot,
      exists: (path: string) => {
        if (path.endsWith(missingModule)) {
          return false;
        }
        return (
          path.endsWith("\\package.json") ||
          REQUIRED_MVP_ENTRYPOINT_FILES.some((entrypointPath) =>
            path.endsWith(entrypointPath.replaceAll("/", "\\"))
          )
        );
      }
    }));
    const output = formatMvpDoctorResult(result);
    const jsonOutput = formatMvpDoctorJsonResult(result);

    expect(result).toMatchObject({ ok: false, reason: "missing-entrypoint" });
    expect(output).toBe("WinBridge MVP doctor failed. reason=missing-entrypoint");
    expect(output).not.toContain(secretRoot);
    expect(output).not.toContain(missingModule);
    expect(output).not.toContain("secret");
    expect(jsonOutput).not.toContain(secretRoot);
    expect(jsonOutput).not.toContain(missingModule);
    expect(jsonOutput).not.toContain("secret");
  });

  it("accepts supported Node versions", () => {
    expect(isSupportedNodeVersion("20.19.0")).toBe(true);
    expect(isSupportedNodeVersion("20.19.1")).toBe(true);
    expect(isSupportedNodeVersion("22.0.0")).toBe(true);
    expect(isSupportedNodeVersion("20.18.9")).toBe(false);
    expect(isSupportedNodeVersion("not-a-version")).toBe(false);
  });

  it("does not import process, socket, HTTP, or native adapter APIs", () => {
    const source = readFileSync(scriptPath, "utf8");

    expect(source).not.toContain("node:child_process");
    expect(source).not.toContain("spawn(");
    expect(source).not.toContain("exec(");
    expect(source).not.toContain("node:net");
    expect(source).not.toContain("node:dgram");
    expect(source).not.toContain("node:http");
    expect(source).not.toContain("node:https");
    expect(source).not.toContain("node:tls");
    expect(source).not.toContain("WebSocket");
    expect(source).not.toContain('from "@winbridge/windows-capture"');
    expect(source).not.toContain('from "@winbridge/windows-input"');
    expect(source).not.toContain('import("@winbridge/windows-capture")');
    expect(source).not.toContain('import("@winbridge/windows-input")');
  });
});

function createDoctorOptions(overrides: {
  platform?: string;
  nodeVersion?: string;
  rootDir?: string;
  packageJson?: unknown;
  exists?: (path: string) => boolean;
} = {}) {
  const packageJson = overrides.packageJson ?? {
    scripts: alignedRootScripts()
  };

  return {
    rootDir: overrides.rootDir ?? "C:\\repo\\winbridge",
    platform: overrides.platform ?? "win32",
    nodeVersion: overrides.nodeVersion ?? "20.19.0",
    readText: () => JSON.stringify(packageJson),
    exists:
      overrides.exists ??
      ((path: string) =>
        REQUIRED_MVP_WORKSPACE_PACKAGES.some((workspacePath) =>
          path.endsWith(`${workspacePath.replaceAll("/", "\\")}\\package.json`)
        ) ||
        REQUIRED_MVP_ENTRYPOINT_FILES.some((entrypointPath) =>
          path.endsWith(entrypointPath.replaceAll("/", "\\"))
        ))
  };
}

function alignedRootScripts() {
  return {
    "dev:relay":
      "npm --workspace @winbridge/protocol run build && npm --workspace @winbridge/audit-log run build && npm --workspace @winbridge/relay run dev",
    "dev:agent":
      "npm --workspace @winbridge/protocol run build && npm --workspace @winbridge/audit-log run build && npm --workspace @winbridge/windows-capture run build && npm --workspace @winbridge/windows-input run build && npm --workspace @winbridge/agent-shell run dev --",
    "mvp:audit-summary": "node scripts/mvp-audit-summary.mjs",
    "mvp:commands": "node scripts/mvp-session-commands.mjs",
    "mvp:native-preflight": "node scripts/mvp-native-preflight.mjs",
    "mvp:ready": "node scripts/mvp-ready.mjs",
    "mvp:smoke": "npm run build && node scripts/mvp-session-smoke.mjs",
    "mvp:trial": "node scripts/mvp-trial.mjs"
  };
}
