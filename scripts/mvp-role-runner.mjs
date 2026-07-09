import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { parseMvpSessionCommandArgs } from "./mvp-session-commands.mjs";

export const MVP_ROLE_RUNNER_USAGE = [
  "Usage: npm run mvp:run -- --role relay|host|viewer --session <id> --pairing 123-456 (--relay ws://host:8787/ | --relay-host HOST) [--token-env NAME] [--dry-run] [--json] [--i-understand-foreground]",
  "",
  "Runs exactly one reviewed WinBridge MVP role in the current foreground terminal.",
  "Live runs require --i-understand-foreground. Raw token values are not accepted."
].join("\n");

const RUNNER_ROLES = new Set(["relay", "host", "viewer"]);
const RUNNER_FLAGS = new Set(["--dry-run", "--json", "--i-understand-foreground"]);
const RUNNER_OPTIONS = new Set(["--role"]);
const REQUIRED_OPTION_NAMES = new Set(["session", "pairing"]);
const FORBIDDEN_FORWARDED_FLAGS = new Set([
  "--help",
  "--only",
  "--preflight-only",
  "--generate-session",
  "--generate-pairing"
]);
const UNSAFE_TOKEN_PATTERN = /[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u;

export class MvpRoleRunnerUsageError extends Error {
  constructor() {
    super(MVP_ROLE_RUNNER_USAGE);
    this.name = "MvpRoleRunnerUsageError";
  }
}

export function parseMvpRoleRunnerArgs(rawArgs) {
  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }
  if (rawArgs.includes("--help")) {
    throw new MvpRoleRunnerUsageError();
  }

  let role;
  let dryRun = false;
  let json = false;
  let acknowledgedForeground = false;
  const forwarded = [];
  const seenForwardedOptions = new Set();

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (RUNNER_FLAGS.has(arg)) {
      if (arg === "--dry-run") {
        if (dryRun) {
          throw new MvpRoleRunnerUsageError();
        }
        dryRun = true;
        continue;
      }
      if (arg === "--json") {
        if (json) {
          throw new MvpRoleRunnerUsageError();
        }
        json = true;
        continue;
      }
      if (acknowledgedForeground) {
        throw new MvpRoleRunnerUsageError();
      }
      acknowledgedForeground = true;
      continue;
    }

    if (RUNNER_OPTIONS.has(arg)) {
      if (role !== undefined) {
        throw new MvpRoleRunnerUsageError();
      }
      const value = rawArgs[index + 1];
      if (!RUNNER_ROLES.has(value)) {
        throw new MvpRoleRunnerUsageError();
      }
      role = value;
      index += 1;
      continue;
    }

    if (FORBIDDEN_FORWARDED_FLAGS.has(arg) || arg === "--token" || arg.startsWith("--token=")) {
      throw new MvpRoleRunnerUsageError();
    }

    if (arg.startsWith("--")) {
      const value = rawArgs[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new MvpRoleRunnerUsageError();
      }
      const optionName = arg.slice(2);
      if (seenForwardedOptions.has(optionName)) {
        throw new MvpRoleRunnerUsageError();
      }
      seenForwardedOptions.add(optionName);
      forwarded.push(arg, value);
      index += 1;
      continue;
    }

    throw new MvpRoleRunnerUsageError();
  }

  if (role === undefined) {
    throw new MvpRoleRunnerUsageError();
  }
  if (![...REQUIRED_OPTION_NAMES].every((name) => seenForwardedOptions.has(name))) {
    throw new MvpRoleRunnerUsageError();
  }
  if (seenForwardedOptions.has("relay") === seenForwardedOptions.has("relay-host")) {
    throw new MvpRoleRunnerUsageError();
  }
  if (!dryRun && !json && !acknowledgedForeground) {
    throw new MvpRoleRunnerUsageError();
  }

  const commandOptions = parseMvpSessionCommandArgs(forwarded);
  if (commandOptions.help || commandOptions.preflightOnly || commandOptions.onlyTarget) {
    throw new MvpRoleRunnerUsageError();
  }

  return {
    help: false,
    role,
    dryRun: dryRun || json,
    json,
    acknowledgedForeground,
    commandOptions
  };
}

export function createMvpRoleRunnerPlan(parsed, dependencies = {}) {
  const npmCommand = dependencies.npmCommand ?? "npm";
  const env = dependencies.env ?? process.env;
  const token = resolveRunnerTokenEnv(env, parsed.commandOptions.tokenEnv, parsed.dryRun);

  if (parsed.role === "relay") {
    return createRelayRunnerPlan(npmCommand, parsed.commandOptions, token, env);
  }
  return createAgentRunnerPlan(
    npmCommand,
    parsed.role,
    parsed.commandOptions,
    parsed.commandOptions.tokenEnv,
    env
  );
}

export function formatMvpRoleRunnerDryRun(plan, options = {}) {
  const payload = {
    ok: true,
    mode: "role-runner",
    role: plan.role,
    foreground: true,
    nonExecuting: true,
    command: plan.command,
    args: plan.sanitizedArgs,
    env: plan.sanitizedEnv
  };

  if (options.json) {
    return JSON.stringify(payload);
  }

  return [
    "WinBridge MVP role runner dry run.",
    `role=${payload.role} foreground=true nonExecuting=true`,
    `command=${payload.command}`,
    `args=${payload.args.join(" ")}`,
    `env=${payload.env.join(",") || "none"}`
  ].join("\n");
}

export function formatMvpRoleRunnerError(error, options = {}) {
  if (options.json) {
    return JSON.stringify({ ok: false, reason: "usage" });
  }
  if (error instanceof MvpRoleRunnerUsageError) {
    return MVP_ROLE_RUNNER_USAGE;
  }
  return "WinBridge MVP role runner failed. reason=spawn-failed";
}

export function runMvpRoleRunner(rawArgs, dependencies = {}) {
  const parsed = parseMvpRoleRunnerArgs(rawArgs);
  if (parsed.help) {
    return { exitCode: 0, output: MVP_ROLE_RUNNER_USAGE };
  }

  const plan = createMvpRoleRunnerPlan(parsed, dependencies);
  if (parsed.dryRun) {
    return {
      exitCode: 0,
      output: formatMvpRoleRunnerDryRun(plan, { json: parsed.json })
    };
  }

  const spawn = dependencies.spawnSync ?? spawnSync;
  const result = spawn(plan.command, plan.args, {
    cwd: dependencies.cwd ?? process.cwd(),
    env: plan.env,
    stdio: "inherit",
    windowsHide: false
  });

  if (result?.error) {
    return { exitCode: 1, output: "WinBridge MVP role runner failed. reason=spawn-failed" };
  }

  return { exitCode: typeof result?.status === "number" ? result.status : 1, output: "" };
}

function createRelayRunnerPlan(npmCommand, options, token, baseEnv) {
  const relayPort = relayEffectivePort(options.relay);
  const env = { ...baseEnv };
  const sanitizedEnv = [];

  if (shouldBindRelayForLan(options.relay)) {
    env.WINBRIDGE_RELAY_BIND_HOST = "0.0.0.0";
    sanitizedEnv.push("WINBRIDGE_RELAY_BIND_HOST");
  }
  if (relayPort !== 8787) {
    env.WINBRIDGE_RELAY_PORT = String(relayPort);
    sanitizedEnv.push("WINBRIDGE_RELAY_PORT");
  }
  if (token !== undefined) {
    env.WINBRIDGE_RELAY_SHARED_TOKEN = token;
    sanitizedEnv.push("WINBRIDGE_RELAY_SHARED_TOKEN");
  }

  const args = ["run", "dev:relay"];
  return {
    role: "relay",
    command: npmCommand,
    args,
    sanitizedArgs: [...args],
    env,
    sanitizedEnv
  };
}

function createAgentRunnerPlan(npmCommand, role, options, tokenEnv, baseEnv) {
  const optionPairs =
    role === "host"
      ? hostAgentOptionPairs(options)
      : viewerAgentOptionPairs(options);
  const args = ["run", "dev:agent", "--", role];
  const sanitizedArgs = ["run", "dev:agent", "--", role];

  for (const [name, value, safeValue] of optionPairs) {
    args.push(`--${name}`, value);
    sanitizedArgs.push(`--${name}`, safeValue);
  }
  if (tokenEnv !== undefined) {
    args.push("--token-env", tokenEnv);
    sanitizedArgs.push("--token-env", "<token-env>");
  }

  return {
    role,
    command: npmCommand,
    args,
    sanitizedArgs,
    env: { ...baseEnv },
    sanitizedEnv: []
  };
}

function hostAgentOptionPairs(options) {
  return [
    ["relay", options.relay, "<relay-url>"],
    ["session", options.session, "<session-id>"],
    ["pairing", options.pairing, "<pairing-code>"],
    ["name", options.hostName, "<display-name>"],
    ["host-consent-prompt", "true", "true"],
    ["host-consent-timeout-ms", String(options.hostConsentTimeoutMs), String(options.hostConsentTimeoutMs)],
    ["visible-session", "true", "true"],
    ["host-control-prompt", "true", "true"],
    ["host-control-surface-port", String(options.hostControlSurfacePort), String(options.hostControlSurfacePort)],
    ["host-signal-probe-ack", "true", "true"],
    ["audit-log", options.hostAuditLog, "<audit-log>"],
    ["host-apply-input", "true", "true"],
    ["dev-screen-frame-after-ms", String(options.captureAfterMs), String(options.captureAfterMs)],
    ["dev-screen-frame-source", "windows-capture", "windows-capture"],
    ["dev-screen-frame-count", String(options.captureCount), String(options.captureCount)],
    ["dev-screen-frame-interval-ms", String(options.captureIntervalMs), String(options.captureIntervalMs)]
  ];
}

function viewerAgentOptionPairs(options) {
  return [
    ["relay", options.relay, "<relay-url>"],
    ["session", options.session, "<session-id>"],
    ["pairing", options.pairing, "<pairing-code>"],
    ["name", options.viewerName, "<display-name>"],
    ["request", "screen:view,input:pointer,input:keyboard", "screen:view,input:pointer,input:keyboard"],
    ["request-reason", options.requestReason, "<request-reason>"],
    ["viewer-signal-probe-after-ms", String(options.viewerSignalProbeAfterMs), String(options.viewerSignalProbeAfterMs)],
    ["audit-log", options.viewerAuditLog, "<audit-log>"],
    ["viewer-screen-frame-output", options.viewerFrameOutput, "<frame-output>"],
    ["viewer-control-surface-port", String(options.viewerControlSurfacePort), String(options.viewerControlSurfacePort)]
  ];
}

function resolveRunnerTokenEnv(env, tokenEnv, dryRun) {
  if (tokenEnv === undefined) {
    return undefined;
  }
  if (dryRun) {
    return "<relay-token>";
  }
  const token = env[tokenEnv];
  if (
    typeof token !== "string" ||
    token.length < 1 ||
    token.trim() !== token ||
    token.length > 1024 ||
    UNSAFE_TOKEN_PATTERN.test(token)
  ) {
    throw new MvpRoleRunnerUsageError();
  }
  return token;
}

function shouldBindRelayForLan(relayUrl) {
  const { hostname } = new URL(relayUrl);
  return !["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname.toLowerCase());
}

function relayEffectivePort(relayUrl) {
  const parsed = new URL(relayUrl);
  if (parsed.port) {
    return Number.parseInt(parsed.port, 10);
  }
  return parsed.protocol === "wss:" ? 443 : 80;
}

function main() {
  try {
    const result = runMvpRoleRunner(process.argv.slice(2));
    if (result.output) {
      process.stdout.write(`${result.output}\n`);
    }
    process.exitCode = result.exitCode;
  } catch (error) {
    const json = process.argv.includes("--json");
    process.stderr.write(`${formatMvpRoleRunnerError(error, { json })}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
