import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const MVP_READY_USAGE = [
  "Usage: npm run mvp:ready -- [options]",
  "",
  "Options:",
  "  --json",
  "  --include-smoke",
  "",
  "Runs local WinBridge MVP readiness checks. Default mode runs only",
  "read-only doctor and native preflight checks; smoke is explicit."
].join("\n");

const FAILURE_REASONS = new Set(["usage", "spawn-failed", "exit-nonzero"]);
const SAFE_SMOKE_SUBCHECK_NAMES = new Set(["relay", "frame", "surface", "signal", "input", "audit"]);
const REQUIRED_COMMAND_PLAN_NAMES = new Set([
  "preflight.ready",
  "preflight.doctor",
  "preflight.native",
  "preflight.smoke",
  "relay",
  "host",
  "viewer",
  "browser"
]);
const MVP_READY_LAN_RELAY_HOST = "192.168.1.10";
const MVP_READY_LAN_RELAY_URL = `ws://${MVP_READY_LAN_RELAY_HOST}:8787/`;
const MVP_READY_TOKEN_ENV_NAME = "WINBRIDGE_RELAY_SHARED_TOKEN";
const OUTPUT_LIMIT_BYTES = 32768;

export class MvpReadyUsageError extends Error {
  constructor() {
    super(MVP_READY_USAGE);
    this.name = "MvpReadyUsageError";
  }
}

export function parseMvpReadyArgs(rawArgs) {
  if (rawArgs.length === 0) {
    return { help: false, json: false, includeSmoke: false };
  }

  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }

  if (rawArgs.includes("--help")) {
    throw new MvpReadyUsageError();
  }

  let json = false;
  let includeSmoke = false;

  for (const arg of rawArgs) {
    if (arg === "--json") {
      if (json) {
        throw new MvpReadyUsageError();
      }
      json = true;
      continue;
    }

    if (arg === "--include-smoke") {
      if (includeSmoke) {
        throw new MvpReadyUsageError();
      }
      includeSmoke = true;
      continue;
    }

    throw new MvpReadyUsageError();
  }

  return { help: false, json, includeSmoke };
}

export function createMvpReadyPlan(options = {}) {
  const npmInvocation = options.npmCommand
    ? { command: options.npmCommand, argsPrefix: [] }
    : defaultNpmInvocation();
  const command = (script) => ({
    command: npmInvocation.command,
    args: [...npmInvocation.argsPrefix, "run", script]
  });
  const commandWithArgs = (script, args) => ({
    command: npmInvocation.command,
    args: [...npmInvocation.argsPrefix, "run", script, "--", ...args]
  });

  return [
    { name: "doctor", ...command("mvp:doctor") },
    { name: "native-preflight", ...command("mvp:native-preflight") },
    { name: "command-plan", ...commandWithArgs("mvp:commands", ["--json"]) },
    {
      name: "lan-command-plan",
      ...commandWithArgs("mvp:commands", ["--json", "--relay-host", MVP_READY_LAN_RELAY_HOST])
    },
    {
      name: "token-command-plan",
      ...commandWithArgs("mvp:commands", ["--json", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    },
    ...(options.includeSmoke ? [{ name: "smoke", ...commandWithArgs("mvp:smoke", ["--json"]) }] : [])
  ];
}

export function runMvpReadyCheck(options = {}) {
  const plan = options.plan ?? createMvpReadyPlan(options);
  const runCommand = options.runCommand ?? runReadyCommand;
  const checks = [];

  for (const step of plan) {
    const result = runCommand(step);
    if (!result.ok) {
      const smokeResult =
        step.name === "smoke" && result.reason === "exit-nonzero"
          ? parseSmokeReadiness(result.output)
          : undefined;
      const failed = {
        name: step.name,
        ok: false,
        reason: safeReadyReason(result.reason),
        ...(smokeResult?.ok === false ? { checks: smokeResult.checks } : {})
      };
      checks.push(failed);
      return {
        ok: false,
        reason: failed.reason,
        checks
      };
    }

    const check = { name: step.name, ok: true };
    if (step.name === "command-plan" && !parseCommandPlanReadiness(result.output)) {
      const failed = {
        name: step.name,
        ok: false,
        reason: "exit-nonzero"
      };
      checks.push(failed);
      return {
        ok: false,
        reason: failed.reason,
        checks
      };
    }

    if (
      step.name === "lan-command-plan" &&
      !parseCommandPlanReadiness(result.output, { expectedRelayUrl: MVP_READY_LAN_RELAY_URL })
    ) {
      const failed = {
        name: step.name,
        ok: false,
        reason: "exit-nonzero"
      };
      checks.push(failed);
      return {
        ok: false,
        reason: failed.reason,
        checks
      };
    }

    if (
      step.name === "token-command-plan" &&
      !parseCommandPlanReadiness(result.output, { expectedTokenEnv: MVP_READY_TOKEN_ENV_NAME })
    ) {
      const failed = {
        name: step.name,
        ok: false,
        reason: "exit-nonzero"
      };
      checks.push(failed);
      return {
        ok: false,
        reason: failed.reason,
        checks
      };
    }

    if (step.name === "smoke") {
      const smokeResult = parseSmokeReadiness(result.output);
      if (smokeResult?.ok !== true) {
        const failed = {
          name: step.name,
          ok: false,
          reason: "exit-nonzero",
          ...(smokeResult?.ok === false ? { checks: smokeResult.checks } : {})
        };
        checks.push(failed);
        return {
          ok: false,
          reason: failed.reason,
          checks
        };
      }
      check.checks = smokeResult.checks;
    }

    checks.push(check);
  }

  if (!options.includeSmoke) {
    checks.push({ name: "smoke", ok: true, skipped: true });
  }

  return {
    ok: true,
    checks
  };
}

export function formatMvpReadyResult(result) {
  const lines = [
    result.ok ? "WinBridge MVP readiness passed." : `WinBridge MVP readiness failed. reason=${safeReadyReason(result.reason)}`
  ];

  for (const check of result.checks) {
    if (check.skipped) {
      lines.push(`${check.name}=skipped`);
      continue;
    }

    lines.push(check.ok ? `${check.name}=ok` : `${check.name}=failed reason=${safeReadyReason(check.reason)}`);
    if (Array.isArray(check.checks)) {
      for (const subcheck of check.checks) {
        if (subcheck.skipped) {
          lines.push(`${check.name}.${subcheck.name}=skipped`);
          continue;
        }
        lines.push(`${check.name}.${subcheck.name}=${subcheck.ok === true ? "ok" : "failed"}`);
      }
    }
  }

  return lines.join("\n");
}

export function formatMvpReadyJsonResult(result) {
  return JSON.stringify({
    ok: result.ok === true,
    ...(result.ok ? {} : { reason: safeReadyReason(result.reason) }),
    checks: result.checks.map((check) => ({
      name: check.name,
      ok: check.ok === true,
      ...(check.skipped ? { skipped: true } : {}),
      ...(Array.isArray(check.checks)
        ? { checks: check.checks.map(formatSmokeSubcheckJson) }
        : {}),
      ...(check.ok ? {} : { reason: safeReadyReason(check.reason) })
    }))
  });
}

export function formatMvpReadyError(error, options = {}) {
  if (options.json) {
    return formatMvpReadyJsonResult({
      ok: false,
      reason: "usage",
      checks: []
    });
  }

  if (error instanceof MvpReadyUsageError) {
    return MVP_READY_USAGE;
  }

  return "WinBridge MVP readiness failed. reason=exit-nonzero";
}

function runReadyCommand(step) {
  const result = spawnSync(step.command, step.args, {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    maxBuffer: OUTPUT_LIMIT_BYTES,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: false
  });

  if (result.error) {
    return { ok: false, reason: "spawn-failed" };
  }

  return result.status === 0
    ? { ok: true, output: boundedOutput(result.stdout) }
    : { ok: false, reason: "exit-nonzero", output: boundedOutput(`${result.stdout}\n${result.stderr}`) };
}

export function parseCommandPlanReadiness(output, options = {}) {
  if (typeof output !== "string" || output.length === 0 || output.length > OUTPUT_LIMIT_BYTES) {
    return false;
  }

  const parsed = parseLastJsonOutputLine(output);
  if (
    !parsed ||
    parsed.ok !== true ||
    parsed.mode !== "session" ||
    parsed.nonExecuting !== true ||
    !Array.isArray(parsed.commands)
  ) {
    return false;
  }

  const seen = new Set();
  const commandsByName = new Map();
  for (const command of parsed.commands) {
    if (!command || typeof command.name !== "string" || seen.has(command.name)) {
      return false;
    }
    seen.add(command.name);
    commandsByName.set(command.name, command);
  }

  if (seen.size !== REQUIRED_COMMAND_PLAN_NAMES.size) {
    return false;
  }

  for (const name of REQUIRED_COMMAND_PLAN_NAMES) {
    if (!seen.has(name)) {
      return false;
    }
  }

  if (
    options.expectedRelayUrl !== undefined &&
    !commandPlanUsesRelayUrl(commandsByName, options.expectedRelayUrl)
  ) {
    return false;
  }

  if (
    options.expectedTokenEnv !== undefined &&
    !commandPlanUsesTokenEnv(commandsByName, options.expectedTokenEnv)
  ) {
    return false;
  }

  return true;
}

function commandPlanUsesRelayUrl(commandsByName, expectedRelayUrl) {
  if (typeof expectedRelayUrl !== "string" || expectedRelayUrl.length === 0) {
    return false;
  }

  const relayCommand = commandsByName.get("relay")?.command;
  const hostCommand = commandsByName.get("host")?.command;
  const viewerCommand = commandsByName.get("viewer")?.command;

  return (
    typeof relayCommand === "string" &&
    typeof hostCommand === "string" &&
    typeof viewerCommand === "string" &&
    relayCommand.includes("WINBRIDGE_RELAY_BIND_HOST") &&
    hostCommand.includes(expectedRelayUrl) &&
    viewerCommand.includes(expectedRelayUrl)
  );
}

function commandPlanUsesTokenEnv(commandsByName, expectedTokenEnv) {
  if (typeof expectedTokenEnv !== "string" || !/^[A-Z][A-Z0-9_]{0,127}$/.test(expectedTokenEnv)) {
    return false;
  }

  const hostCommand = commandsByName.get("host")?.command;
  const viewerCommand = commandsByName.get("viewer")?.command;
  const tokenReference = `$env:${expectedTokenEnv}`;

  return (
    typeof hostCommand === "string" &&
    typeof viewerCommand === "string" &&
    hostCommand.includes(`--token ${tokenReference}`) &&
    viewerCommand.includes(`--token ${tokenReference}`)
  );
}

export function parseSmokeSubchecks(output) {
  const result = parseSmokeReadiness(output);
  return result?.ok === true ? result.checks : undefined;
}

export function parseSmokeReadiness(output) {
  if (typeof output !== "string" || output.length === 0 || output.length > OUTPUT_LIMIT_BYTES) {
    return undefined;
  }

  const parsed = parseLastJsonOutputLine(output);
  if (parsed === undefined) {
    return undefined;
  }

  if (!parsed || (parsed.ok !== true && parsed.ok !== false) || !Array.isArray(parsed.checks)) {
    return undefined;
  }

  const expectedOk = parsed.ok === true;
  const seen = new Set();
  const subchecks = [];
  for (const check of parsed.checks) {
    if (
      !check ||
      typeof check.name !== "string" ||
      !SAFE_SMOKE_SUBCHECK_NAMES.has(check.name) ||
      seen.has(check.name) ||
      typeof check.ok !== "boolean" ||
      (expectedOk && check.ok !== true) ||
      (!expectedOk && "skipped" in check && check.skipped !== true) ||
      (!expectedOk && check.skipped === true && check.ok !== false)
    ) {
      return undefined;
    }
    seen.add(check.name);
    subchecks.push({
      name: check.name,
      ok: check.ok,
      ...(check.skipped === true ? { skipped: true } : {})
    });
  }

  if (subchecks.length !== SAFE_SMOKE_SUBCHECK_NAMES.size) {
    return undefined;
  }

  if (!expectedOk && !subchecks.some((check) => check.ok === false && !check.skipped)) {
    return undefined;
  }

  return { ok: expectedOk, checks: subchecks };
}

function formatSmokeSubcheckJson(subcheck) {
  return {
    name: subcheck.name,
    ok: subcheck.ok === true,
    ...(subcheck.skipped ? { skipped: true } : {})
  };
}

function parseLastJsonOutputLine(output) {
  const lines = output.split(/\r?\n/).filter((line) => line.trim().length > 0);
  for (const line of lines.reverse()) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
      continue;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function boundedOutput(output) {
  if (typeof output !== "string") {
    return "";
  }

  return output.slice(0, OUTPUT_LIMIT_BYTES);
}

function safeReadyReason(reason) {
  return FAILURE_REASONS.has(reason) ? reason : "exit-nonzero";
}

function defaultNpmInvocation() {
  if (process.env.npm_execpath) {
    return { command: process.execPath, argsPrefix: [process.env.npm_execpath] };
  }

  if (process.platform === "win32") {
    return { command: "cmd.exe", argsPrefix: ["/d", "/s", "/c", "npm"] };
  }

  return { command: "npm", argsPrefix: [] };
}

function runCli(rawArgs = process.argv.slice(2), streams = process) {
  const wantsJson = rawArgs.includes("--json");

  try {
    const parsed = parseMvpReadyArgs(rawArgs);
    if (parsed.help) {
      streams.stdout.write(`${MVP_READY_USAGE}\n`);
      return 0;
    }

    const result = runMvpReadyCheck({ includeSmoke: parsed.includeSmoke });
    const output = parsed.json ? formatMvpReadyJsonResult(result) : formatMvpReadyResult(result);
    const stream = result.ok ? streams.stdout : streams.stderr;
    stream.write(`${output}\n`);
    return result.ok ? 0 : 1;
  } catch (error) {
    streams.stderr.write(`${formatMvpReadyError(error, { json: wantsJson })}\n`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runCli();
}
