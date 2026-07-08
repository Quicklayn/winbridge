import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const MVP_DOCTOR_USAGE = [
  "Usage: npm run mvp:doctor",
  "",
  "Checks local WinBridge MVP readiness without starting relay, host, viewer,",
  "browser, capture, input, services, startup persistence, or unattended access."
].join("\n");

export const REQUIRED_MVP_ROOT_SCRIPTS = Object.freeze([
  "dev:relay",
  "dev:agent",
  "mvp:audit-summary",
  "mvp:commands",
  "mvp:native-preflight",
  "mvp:ready",
  "mvp:smoke",
  "mvp:trial"
]);

export const REQUIRED_MVP_WORKSPACE_PACKAGES = Object.freeze([
  "apps/agent-shell",
  "apps/relay",
  "packages/audit-log",
  "packages/protocol",
  "packages/windows-capture",
  "packages/windows-input"
]);

export const REQUIRED_MVP_ENTRYPOINT_FILES = Object.freeze([
  "apps/agent-shell/src/index.ts",
  "apps/agent-shell/src/cli-shutdown.ts",
  "apps/agent-shell/src/host-control-prompt.ts",
  "apps/agent-shell/src/host-local-control-surface.ts",
  "apps/agent-shell/src/screen-frame-output.ts",
  "apps/agent-shell/src/viewer-control-prompt.ts",
  "apps/agent-shell/src/viewer-local-control-surface.ts",
  "apps/relay/src/index.ts",
  "packages/audit-log/src/index.ts",
  "packages/protocol/src/index.ts",
  "packages/windows-capture/src/index.ts",
  "packages/windows-input/src/index.ts",
  "scripts/mvp-audit-summary.mjs",
  "scripts/mvp-doctor.mjs",
  "scripts/mvp-native-preflight.mjs",
  "scripts/mvp-ready.mjs",
  "scripts/mvp-session-commands.mjs",
  "scripts/mvp-session-smoke.mjs",
  "scripts/mvp-trial.mjs"
]);

const MINIMUM_NODE_VERSION = Object.freeze({ major: 20, minor: 19, patch: 0 });
const FAILURE_REASONS = new Set([
  "unsupported-platform",
  "unsupported-node",
  "missing-root-script",
  "script-misaligned",
  "missing-workspace-manifest",
  "missing-entrypoint",
  "invalid-package-json"
]);

const REQUIRED_ROOT_SCRIPT_ALIGNMENT = Object.freeze({
  "dev:agent": Object.freeze([
    "npm --workspace @winbridge/protocol run build",
    "npm --workspace @winbridge/audit-log run build",
    "npm --workspace @winbridge/windows-capture run build",
    "npm --workspace @winbridge/windows-input run build",
    "npm --workspace @winbridge/agent-shell run dev --"
  ]),
  "dev:relay": Object.freeze([
    "npm --workspace @winbridge/protocol run build",
    "npm --workspace @winbridge/audit-log run build",
    "npm --workspace @winbridge/relay run dev"
  ]),
  "mvp:smoke": Object.freeze(["npm run build", "node scripts/mvp-session-smoke.mjs"])
});

export class MvpDoctorUsageError extends Error {
  constructor() {
    super(MVP_DOCTOR_USAGE);
    this.name = "MvpDoctorUsageError";
  }
}

export function parseMvpDoctorArgs(rawArgs) {
  if (rawArgs.length === 0) {
    return { help: false, json: false };
  }
  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }
  if (rawArgs.length === 1 && rawArgs[0] === "--json") {
    return { help: false, json: true };
  }
  throw new MvpDoctorUsageError();
}

export function runMvpDoctorCheck(options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const platform = options.platform ?? process.platform;
  const nodeVersion = options.nodeVersion ?? process.versions.node;
  const readText = options.readText ?? ((path) => readFileSync(path, "utf8"));
  const exists = options.exists ?? existsSync;

  const packageJson = readRootPackageJson(rootDir, readText);
  const checks = [
    checkWindowsPlatform(platform),
    checkNodeVersion(nodeVersion),
    checkRootScripts(packageJson),
    checkWorkspaceManifests(rootDir, exists),
    checkEntrypointFiles(rootDir, exists)
  ];
  const failed = checks.find((check) => !check.ok);

  return {
    ok: failed === undefined,
    reason: failed?.reason,
    checks
  };
}

export function formatMvpDoctorResult(result) {
  if (result.ok) {
    return [
      "WinBridge MVP doctor passed.",
      "platform=windows",
      "node=ok",
      "scripts=ok",
      "workspaces=ok",
      "entrypoints=ok",
      "safety=visible-consent-required"
    ].join("\n");
  }

  const reason = safeDoctorReason(result.reason);
  return `WinBridge MVP doctor failed. reason=${reason}`;
}

export function formatMvpDoctorJsonResult(result) {
  return JSON.stringify({
    ok: result.ok === true,
    ...(result.ok ? {} : { reason: safeDoctorReason(result.reason) }),
    checks: result.checks.map((check) => ({
      name: check.name,
      ok: check.ok === true,
      ...(check.ok ? {} : { reason: safeDoctorReason(check.reason) })
    }))
  });
}

export function formatMvpDoctorError(error) {
  if (error instanceof MvpDoctorUsageError) {
    return MVP_DOCTOR_USAGE;
  }

  return "WinBridge MVP doctor failed. reason=invalid-package-json";
}

function readRootPackageJson(rootDir, readText) {
  try {
    const parsed = JSON.parse(readText(join(rootDir, "package.json")));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("invalid-package-json");
    }
    return parsed;
  } catch {
    throw new Error("invalid-package-json");
  }
}

function safeDoctorReason(reason) {
  return FAILURE_REASONS.has(reason) ? reason : "invalid-package-json";
}

function checkWindowsPlatform(platform) {
  return platform === "win32"
    ? { name: "platform", ok: true }
    : { name: "platform", ok: false, reason: "unsupported-platform" };
}

function checkNodeVersion(nodeVersion) {
  return isSupportedNodeVersion(nodeVersion)
    ? { name: "node", ok: true }
    : { name: "node", ok: false, reason: "unsupported-node" };
}

export function isSupportedNodeVersion(nodeVersion) {
  const version = parseNodeVersion(nodeVersion);
  if (version === undefined) {
    return false;
  }

  if (version.major !== MINIMUM_NODE_VERSION.major) {
    return version.major > MINIMUM_NODE_VERSION.major;
  }
  if (version.minor !== MINIMUM_NODE_VERSION.minor) {
    return version.minor > MINIMUM_NODE_VERSION.minor;
  }
  return version.patch >= MINIMUM_NODE_VERSION.patch;
}

function parseNodeVersion(nodeVersion) {
  if (typeof nodeVersion !== "string") {
    return undefined;
  }

  const match = nodeVersion.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    return undefined;
  }

  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10)
  };
}

function checkRootScripts(packageJson) {
  const scripts = packageJson.scripts;
  if (typeof scripts !== "object" || scripts === null || Array.isArray(scripts)) {
    return { name: "scripts", ok: false, reason: "missing-root-script" };
  }

  if (!REQUIRED_MVP_ROOT_SCRIPTS.every((script) => typeof scripts[script] === "string")) {
    return { name: "scripts", ok: false, reason: "missing-root-script" };
  }

  return hasAlignedRootScripts(scripts)
    ? { name: "scripts", ok: true }
    : { name: "scripts", ok: false, reason: "script-misaligned" };
}

function hasAlignedRootScripts(scripts) {
  return Object.entries(REQUIRED_ROOT_SCRIPT_ALIGNMENT).every(([scriptName, tokens]) =>
    hasOrderedTokens(scripts[scriptName], tokens)
  );
}

function hasOrderedTokens(value, tokens) {
  if (typeof value !== "string") {
    return false;
  }

  let cursor = 0;
  for (const token of tokens) {
    const index = value.indexOf(token, cursor);
    if (index < 0) {
      return false;
    }
    cursor = index + token.length;
  }
  return true;
}

function checkWorkspaceManifests(rootDir, exists) {
  return REQUIRED_MVP_WORKSPACE_PACKAGES.every((workspacePath) =>
    exists(join(rootDir, workspacePath, "package.json"))
  )
    ? { name: "workspaces", ok: true }
    : { name: "workspaces", ok: false, reason: "missing-workspace-manifest" };
}

function checkEntrypointFiles(rootDir, exists) {
  return REQUIRED_MVP_ENTRYPOINT_FILES.every((entrypointPath) =>
    exists(join(rootDir, entrypointPath))
  )
    ? { name: "entrypoints", ok: true }
    : { name: "entrypoints", ok: false, reason: "missing-entrypoint" };
}

function runCli(rawArgs = process.argv.slice(2), streams = process) {
  try {
    const parsed = parseMvpDoctorArgs(rawArgs);
    if (parsed.help) {
      streams.stdout.write(`${MVP_DOCTOR_USAGE}\n`);
      return 0;
    }

    const result = runMvpDoctorCheck();
    const output = parsed.json ? formatMvpDoctorJsonResult(result) : formatMvpDoctorResult(result);
    const stream = result.ok ? streams.stdout : streams.stderr;
    stream.write(`${output}\n`);
    return result.ok ? 0 : 1;
  } catch (error) {
    streams.stderr.write(`${formatMvpDoctorError(error)}\n`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runCli();
}
