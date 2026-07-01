import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const MVP_READY_USAGE = [
  "Usage: npm run mvp:ready -- [options]",
  "",
  "Options:",
  "  --json",
  "  --include-smoke",
  "  --include-token-smoke",
  "  --include-lan-token-smoke",
  "  --include-windows-capture-smoke",
  "  --include-windows-input-smoke",
  "  --include-windows-control-smoke",
  "  --include-all-smoke",
  "  --role relay|host|viewer",
  "",
  "Runs local WinBridge MVP readiness checks. Default mode runs doctor, native",
  "preflight, and non-executing command-plan validation for reviewed",
  "role-filter, LAN, token-env, and ephemeral browser outputs.",
  "Smoke checks are explicit through include flags."
].join("\n");

const FAILURE_REASONS = new Set(["usage", "spawn-failed", "exit-nonzero"]);
const SAFE_SMOKE_SUBCHECK_NAMES = new Set([
  "relay",
  "indicator",
  "host-surface",
  "frame",
  "surface",
  "signal",
  "surface-guards",
  "input",
  "audit",
  "lifecycle",
  "viewer-disconnect"
]);
const SAFE_WINDOWS_INPUT_SMOKE_SUBCHECK_NAMES = new Set([
  "relay",
  "indicator",
  "host-surface",
  "frame",
  "surface",
  "signal",
  "surface-guards",
  "input",
  "windows-input",
  "audit",
  "lifecycle",
  "viewer-disconnect"
]);
const SAFE_SMOKE_AUDIT_SUMMARY_ROLES = Object.freeze(["host", "viewer"]);
const SAFE_SMOKE_AUDIT_SUMMARY_COUNTS = Object.freeze(["records", "accepted", "denied", "failed"]);
const SAFE_SMOKE_AUDIT_SUMMARY_FLAGS = Object.freeze([
  "authorizationApproved",
  "authorizationActive",
  "screenFrameSent",
  "screenFrameOutput",
  "inputSent",
  "permissionRevoked"
]);
const REQUIRED_COMMAND_PLAN_NAMES = new Set([
  "preflight.ready",
  "preflight.doctor",
  "preflight.native",
  "preflight.smoke",
  "preflight.ready-all-smoke",
  "preflight.audit-summary",
  "relay",
  "host",
  "viewer",
  "browser"
]);
const REQUIRED_PREFLIGHT_COMMAND_PLAN_NAMES = new Set([
  "preflight.ready",
  "preflight.doctor",
  "preflight.native",
  "preflight.smoke",
  "preflight.ready-all-smoke",
  "preflight.audit-summary"
]);
const MVP_READY_LAN_RELAY_HOST = "192.168.1.10";
const MVP_READY_LAN_RELAY_URL = `ws://${MVP_READY_LAN_RELAY_HOST}:8787/`;
const MVP_READY_TOKEN_ENV_NAME = "WINBRIDGE_RELAY_SHARED_TOKEN";
const REVIEWED_HOST_CONSENT_TIMEOUT_ARG = "--host-consent-timeout-ms '60000'";
const REVIEWED_HOST_CONTROL_SURFACE_ARG = "--host-control-surface-port '0'";
const REVIEWED_AUDIT_SUMMARY_COMMAND =
  "npm run mvp:audit-summary -- --host 'logs\\host-audit.jsonl' --viewer 'logs\\viewer-audit.jsonl' --require-mvp-evidence";
const EPHEMERAL_VIEWER_SURFACE_BROWSER_INSTRUCTION =
  "Open the viewer local control surface URL printed by the viewer command log.";
const OUTPUT_LIMIT_BYTES = 32768;
const MVP_READY_ROLES = Object.freeze(["relay", "host", "viewer"]);
const ROLE_FILTER_TARGETS = Object.freeze(["relay", "host", "viewer", "browser", "preflight"]);
const ROLE_FILTER_STEP_TARGETS = new Map(
  ROLE_FILTER_TARGETS.map((target) => [`role-filter-${target}-command`, target])
);
const ROLE_FILTER_SHARED_MARKERS = Object.freeze([
  "Run this command manually in a visible PowerShell terminal.",
  "Safety checks:",
  "This helper printed commands only"
]);
const ROLE_FILTER_LIVE_COMMAND_MARKERS = Object.freeze([
  "npm run dev:relay",
  "npm run dev:agent -- host",
  "npm run dev:agent -- viewer",
  "Start-Process 'http://127.0.0.1:35987/'"
]);
const ROLE_FILTER_RUNTIME_BLOCK_MARKERS = Object.freeze([
  "relay command:",
  "host command:",
  "viewer command:",
  "browser command:"
]);

export class MvpReadyUsageError extends Error {
  constructor() {
    super(MVP_READY_USAGE);
    this.name = "MvpReadyUsageError";
  }
}

export function parseMvpReadyArgs(rawArgs) {
  if (rawArgs.length === 0) {
    return {
      help: false,
      json: false,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeAllSmoke: false
    };
  }

  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }

  if (rawArgs.includes("--help")) {
    throw new MvpReadyUsageError();
  }

  let json = false;
  let includeSmoke = false;
  let includeTokenSmoke = false;
  let includeLanTokenSmoke = false;
  let includeWindowsCaptureSmoke = false;
  let includeWindowsInputSmoke = false;
  let includeWindowsControlSmoke = false;
  let includeAllSmoke = false;
  let role;

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
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

    if (arg === "--include-token-smoke") {
      if (includeTokenSmoke) {
        throw new MvpReadyUsageError();
      }
      includeTokenSmoke = true;
      continue;
    }

    if (arg === "--include-lan-token-smoke") {
      if (includeLanTokenSmoke) {
        throw new MvpReadyUsageError();
      }
      includeLanTokenSmoke = true;
      continue;
    }

    if (arg === "--include-windows-capture-smoke") {
      if (includeWindowsCaptureSmoke) {
        throw new MvpReadyUsageError();
      }
      includeWindowsCaptureSmoke = true;
      continue;
    }

    if (arg === "--include-windows-input-smoke") {
      if (includeWindowsInputSmoke) {
        throw new MvpReadyUsageError();
      }
      includeWindowsInputSmoke = true;
      continue;
    }

    if (arg === "--include-windows-control-smoke") {
      if (includeWindowsControlSmoke) {
        throw new MvpReadyUsageError();
      }
      includeWindowsControlSmoke = true;
      continue;
    }

    if (arg === "--include-all-smoke") {
      if (includeAllSmoke) {
        throw new MvpReadyUsageError();
      }
      includeAllSmoke = true;
      continue;
    }

    if (arg === "--role") {
      if (role !== undefined) {
        throw new MvpReadyUsageError();
      }
      const value = rawArgs[index + 1];
      if (typeof value !== "string" || value.startsWith("--") || !MVP_READY_ROLES.includes(value)) {
        throw new MvpReadyUsageError();
      }
      role = value;
      index += 1;
      continue;
    }

    throw new MvpReadyUsageError();
  }

  if (includeAllSmoke && (includeSmoke || includeTokenSmoke || includeLanTokenSmoke)) {
    throw new MvpReadyUsageError();
  }

  if (
    role !== undefined &&
    (
      includeSmoke ||
      includeTokenSmoke ||
      includeLanTokenSmoke ||
      includeWindowsCaptureSmoke ||
      includeWindowsInputSmoke ||
      includeWindowsControlSmoke ||
      includeAllSmoke
    )
  ) {
    throw new MvpReadyUsageError();
  }

  return {
    help: false,
    json,
    includeSmoke,
    includeTokenSmoke,
    includeLanTokenSmoke,
    includeWindowsCaptureSmoke,
    includeWindowsInputSmoke,
    includeWindowsControlSmoke,
    includeAllSmoke,
    ...(role ? { role } : {})
  };
}

export function createMvpReadyPlan(options = {}) {
  const role = normalizeMvpReadyRole(options.role);
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

  if (role) {
    return createRoleMvpReadyPlan(role, command, commandWithArgs);
  }

  return [
    { name: "doctor", ...command("mvp:doctor") },
    { name: "native-preflight", ...command("mvp:native-preflight") },
    { name: "command-plan", ...commandWithArgs("mvp:commands", ["--json"]) },
    {
      name: "ephemeral-command-plan",
      ...commandWithArgs("mvp:commands", ["--json", "--viewer-control-surface-port", "0"])
    },
    {
      name: "lan-command-plan",
      ...commandWithArgs("mvp:commands", [
        "--json",
        "--relay-host",
        MVP_READY_LAN_RELAY_HOST,
        "--token-env",
        MVP_READY_TOKEN_ENV_NAME
      ])
    },
    {
      name: "token-command-plan",
      ...commandWithArgs("mvp:commands", ["--json", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    },
    {
      name: "preflight-json-command-plan",
      ...commandWithArgs("mvp:commands", ["--only", "preflight", "--json"])
    },
    {
      name: "preflight-token-json-command-plan",
      ...commandWithArgs("mvp:commands", [
        "--only",
        "preflight",
        "--json",
        "--token-env",
        MVP_READY_TOKEN_ENV_NAME
      ])
    },
    {
      name: "token-role-filter-preflight-command",
      ...commandWithArgs("mvp:commands", ["--only", "preflight", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    },
    ...ROLE_FILTER_TARGETS.map((target) => ({
      name: `role-filter-${target}-command`,
      ...commandWithArgs("mvp:commands", ["--only", target])
    })),
    {
      name: "lan-role-filter-relay-command",
      ...commandWithArgs("mvp:commands", [
        "--only",
        "relay",
        "--relay-host",
        MVP_READY_LAN_RELAY_HOST,
        "--token-env",
        MVP_READY_TOKEN_ENV_NAME
      ])
    },
    {
      name: "lan-role-filter-host-command",
      ...commandWithArgs("mvp:commands", [
        "--only",
        "host",
        "--relay-host",
        MVP_READY_LAN_RELAY_HOST,
        "--token-env",
        MVP_READY_TOKEN_ENV_NAME
      ])
    },
    {
      name: "lan-role-filter-viewer-command",
      ...commandWithArgs("mvp:commands", [
        "--only",
        "viewer",
        "--relay-host",
        MVP_READY_LAN_RELAY_HOST,
        "--token-env",
        MVP_READY_TOKEN_ENV_NAME
      ])
    },
    {
      name: "token-role-filter-relay-command",
      ...commandWithArgs("mvp:commands", ["--only", "relay", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    },
    {
      name: "token-role-filter-host-command",
      ...commandWithArgs("mvp:commands", ["--only", "host", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    },
    {
      name: "token-role-filter-viewer-command",
      ...commandWithArgs("mvp:commands", ["--only", "viewer", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    },
    {
      name: "token-role-filter-browser-command",
      ...commandWithArgs("mvp:commands", ["--only", "browser", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    },
    {
      name: "ephemeral-role-filter-browser-command",
      ...commandWithArgs("mvp:commands", ["--only", "browser", "--viewer-control-surface-port", "0"])
    },
    ...(options.includeSmoke || options.includeAllSmoke
      ? [
          { name: "smoke", ...commandWithArgs("mvp:smoke", ["--json"]) },
          { name: "lan-smoke", ...commandWithArgs("mvp:smoke", ["--json", "--lan-relay"]) }
        ]
      : []),
    ...(options.includeTokenSmoke || options.includeAllSmoke
      ? [
          {
            name: "token-smoke",
            ...commandWithArgs("mvp:smoke", [
              "--json",
              "--token-env",
              MVP_READY_TOKEN_ENV_NAME
            ])
          }
        ]
      : []),
    ...(options.includeLanTokenSmoke || options.includeAllSmoke
      ? [
          {
            name: "lan-token-smoke",
            ...commandWithArgs("mvp:smoke", [
              "--json",
              "--lan-relay",
              "--token-env",
              MVP_READY_TOKEN_ENV_NAME
            ])
          }
        ]
      : []),
    ...(options.includeWindowsCaptureSmoke
      ? [
          {
            name: "windows-capture-smoke",
            ...commandWithArgs("mvp:smoke", ["--json", "--windows-capture"])
          }
        ]
      : []),
    ...(options.includeWindowsInputSmoke
      ? [
          {
            name: "windows-input-smoke",
            ...commandWithArgs("mvp:smoke", ["--json", "--windows-input"])
          }
        ]
      : []),
    ...(options.includeWindowsControlSmoke
      ? [
          {
            name: "windows-control-smoke",
            ...commandWithArgs("mvp:smoke", [
              "--json",
              "--windows-capture",
              "--windows-input"
            ])
          }
        ]
      : [])
  ];
}

export function runMvpReadyCheck(options = {}) {
  const role = normalizeMvpReadyRole(options.role);
  const plan = options.plan ?? createMvpReadyPlan(options);
  const runCommand = options.runCommand ?? runReadyCommand;
  const checks = [];

  for (const step of plan) {
    const result = runCommand(step);
    if (!result.ok) {
      const smokeResult =
        isSmokeStep(step.name) && result.reason === "exit-nonzero"
          ? parseSmokeReadiness(result.output, smokeReadinessOptionsForStep(step.name))
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

    if (step.name === "ephemeral-command-plan" && !parseEphemeralCommandPlanReadiness(result.output)) {
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
      !parseCommandPlanReadiness(result.output, {
        expectedRelayUrl: MVP_READY_LAN_RELAY_URL,
        expectedRelayBindHost: "0.0.0.0",
        expectedTokenEnv: MVP_READY_TOKEN_ENV_NAME
      })
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

    if (
      step.name === "preflight-json-command-plan" &&
      !parsePreflightCommandPlanReadiness(result.output)
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
      step.name === "preflight-token-json-command-plan" &&
      !parsePreflightCommandPlanReadiness(result.output, {
        expectedTokenEnv: MVP_READY_TOKEN_ENV_NAME
      })
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

    const roleFilterTarget = roleFilterTargetForStep(step.name);
    if (
      roleFilterTarget !== undefined &&
      !parseRoleFilteredCommandReadiness(result.output, roleFilterTarget)
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
      step.name === "ephemeral-role-filter-browser-command" &&
      !parseEphemeralBrowserRoleFilteredCommandReadiness(result.output)
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
      step.name === "lan-role-filter-relay-command" &&
      !parseLanRelayRoleFilteredCommandReadiness(result.output)
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
      step.name === "lan-role-filter-host-command" &&
      !parseLanAgentRoleFilteredCommandReadiness(result.output, "host")
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
      step.name === "lan-role-filter-viewer-command" &&
      !parseLanAgentRoleFilteredCommandReadiness(result.output, "viewer")
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
      step.name === "token-role-filter-relay-command" &&
      !parseTokenEnvRelayRoleFilteredCommandReadiness(result.output)
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
      step.name === "token-role-filter-host-command" &&
      !parseTokenEnvAgentRoleFilteredCommandReadiness(result.output, "host")
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
      step.name === "token-role-filter-viewer-command" &&
      !parseTokenEnvAgentRoleFilteredCommandReadiness(result.output, "viewer")
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
      step.name === "token-role-filter-browser-command" &&
      !parseTokenEnvBrowserRoleFilteredCommandReadiness(result.output)
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
      step.name === "token-role-filter-preflight-command" &&
      !parseTokenEnvPreflightRoleFilteredCommandReadiness(result.output)
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

    if (isSmokeStep(step.name)) {
      const smokeResult = parseSmokeReadiness(result.output, smokeReadinessOptionsForStep(step.name));
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
      if (smokeResult.auditSummary) {
        check.auditSummary = smokeResult.auditSummary;
      }
    }

    checks.push(check);
  }

  const includeSmoke = options.includeSmoke || options.includeAllSmoke;
  const includeTokenSmoke = options.includeTokenSmoke || options.includeAllSmoke;
  const includeLanTokenSmoke = options.includeLanTokenSmoke || options.includeAllSmoke;
  const includeWindowsCaptureSmoke = options.includeWindowsCaptureSmoke === true;
  const includeWindowsInputSmoke = options.includeWindowsInputSmoke === true;
  const includeWindowsControlSmoke = options.includeWindowsControlSmoke === true;
  if (!includeSmoke && !role) {
    checks.push({ name: "smoke", ok: true, skipped: true });
    checks.push({ name: "lan-smoke", ok: true, skipped: true });
  }
  if (!includeTokenSmoke && !role) {
    checks.push({ name: "token-smoke", ok: true, skipped: true });
  }
  if (!includeLanTokenSmoke && !role) {
    checks.push({ name: "lan-token-smoke", ok: true, skipped: true });
  }
  if (!includeWindowsCaptureSmoke && !role) {
    checks.push({ name: "windows-capture-smoke", ok: true, skipped: true });
  }
  if (!includeWindowsInputSmoke && !role) {
    checks.push({ name: "windows-input-smoke", ok: true, skipped: true });
  }
  if (!includeWindowsControlSmoke && !role) {
    checks.push({ name: "windows-control-smoke", ok: true, skipped: true });
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
    const auditSummary = parseSmokeAuditSummary(check.auditSummary);
    if (auditSummary) {
      lines.push(...formatReadyAuditSummaryLines(check.name, auditSummary));
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
      ...(parseSmokeAuditSummary(check.auditSummary)
        ? { auditSummary: parseSmokeAuditSummary(check.auditSummary) }
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

function isSmokeStep(name) {
  return (
    name === "smoke" ||
    name === "lan-smoke" ||
    name === "token-smoke" ||
    name === "lan-token-smoke" ||
    name === "windows-capture-smoke" ||
    name === "windows-input-smoke" ||
    name === "windows-control-smoke"
  );
}

function smokeReadinessOptionsForStep(name) {
  return { windowsInput: name === "windows-input-smoke" || name === "windows-control-smoke" };
}

function roleFilterTargetForStep(name) {
  return ROLE_FILTER_STEP_TARGETS.get(name);
}

function normalizeMvpReadyRole(role) {
  if (role === undefined) {
    return undefined;
  }
  if (!MVP_READY_ROLES.includes(role)) {
    throw new MvpReadyUsageError();
  }
  return role;
}

function createRoleMvpReadyPlan(role, command, commandWithArgs) {
  const steps = [{ name: "doctor", ...command("mvp:doctor") }];

  if (role === "host" || role === "viewer") {
    steps.push({ name: "native-preflight", ...command("mvp:native-preflight") });
  }

  if (role === "viewer") {
    steps.push({
      name: "role-filter-viewer-command",
      ...commandWithArgs("mvp:commands", ["--only", "viewer"])
    });
    steps.push({
      name: "lan-role-filter-viewer-command",
      ...commandWithArgs("mvp:commands", [
        "--only",
        "viewer",
        "--relay-host",
        MVP_READY_LAN_RELAY_HOST,
        "--token-env",
        MVP_READY_TOKEN_ENV_NAME
      ])
    });
    steps.push({
      name: "token-role-filter-viewer-command",
      ...commandWithArgs("mvp:commands", ["--only", "viewer", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    });
    steps.push({
      name: "role-filter-browser-command",
      ...commandWithArgs("mvp:commands", ["--only", "browser"])
    });
    steps.push({
      name: "token-role-filter-browser-command",
      ...commandWithArgs("mvp:commands", ["--only", "browser", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    });
  } else {
    steps.push({
      name: `role-filter-${role}-command`,
      ...commandWithArgs("mvp:commands", ["--only", role])
    });
  }

  if (role === "host") {
    steps.push({
      name: "lan-role-filter-host-command",
      ...commandWithArgs("mvp:commands", [
        "--only",
        "host",
        "--relay-host",
        MVP_READY_LAN_RELAY_HOST,
        "--token-env",
        MVP_READY_TOKEN_ENV_NAME
      ])
    });
    steps.push({
      name: "token-role-filter-host-command",
      ...commandWithArgs("mvp:commands", ["--only", "host", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    });
  }

  if (role === "relay") {
    steps.push({
      name: "lan-role-filter-relay-command",
      ...commandWithArgs("mvp:commands", [
        "--only",
        "relay",
        "--relay-host",
        MVP_READY_LAN_RELAY_HOST,
        "--token-env",
        MVP_READY_TOKEN_ENV_NAME
      ])
    });
    steps.push({
      name: "token-role-filter-relay-command",
      ...commandWithArgs("mvp:commands", ["--only", "relay", "--token-env", MVP_READY_TOKEN_ENV_NAME])
    });
  }

  if (role === "viewer") {
    steps.push({
      name: "ephemeral-role-filter-browser-command",
      ...commandWithArgs("mvp:commands", ["--only", "browser", "--viewer-control-surface-port", "0"])
    });
  }

  return steps;
}

export function parseCommandPlanReadiness(output, options = {}) {
  if (typeof output !== "string" || output.length === 0 || output.length > OUTPUT_LIMIT_BYTES) {
    return false;
  }

  const parsed = parseLastJsonOutputLine(output);
  if (
    !parsed ||
    !hasExactCommandPlanShape(parsed) ||
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
    if (
      !command ||
      typeof command.name !== "string" ||
      typeof command.command !== "string" ||
      seen.has(command.name)
    ) {
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
    !commandPlanUsesRelayUrl(commandsByName, options.expectedRelayUrl, {
      expectedRelayBindHost: options.expectedRelayBindHost
    })
  ) {
    return false;
  }

  if (
    options.expectedTokenEnv !== undefined &&
    !commandPlanUsesTokenEnv(commandsByName, options.expectedTokenEnv)
  ) {
    return false;
  }

  return (
    commandPlanUsesReviewedHostConsentTimeout(commandsByName) &&
    commandPlanUsesReviewedHostControlSurface(commandsByName) &&
    commandPlanUsesReviewedAuditSummary(commandsByName)
  );
}

export function parseEphemeralCommandPlanReadiness(output) {
  const commandsByName = parseCommandPlanCommandsByName(output);
  if (!commandsByName) {
    return false;
  }

  const viewerCommand = commandsByName.get("viewer")?.command;
  const hostCommand = commandsByName.get("host")?.command;
  const browserCommand = commandsByName.get("browser")?.command;
  const allCommands = [...commandsByName.values()].map((command) => command.command).join("\n");

  return (
    typeof hostCommand === "string" &&
    typeof viewerCommand === "string" &&
    typeof browserCommand === "string" &&
    hostCommandHasReviewedConsentTimeout(hostCommand) &&
    hostCommandHasReviewedControlSurface(hostCommand) &&
    viewerCommand.includes("--viewer-control-surface-port '0'") &&
    browserCommand === EPHEMERAL_VIEWER_SURFACE_BROWSER_INSTRUCTION &&
    !allCommands.includes("http://127.0.0.1:0/")
  );
}

export function parsePreflightCommandPlanReadiness(output, options = {}) {
  if (typeof output !== "string" || output.length === 0 || output.length > OUTPUT_LIMIT_BYTES) {
    return false;
  }

  const parsed = parseLastJsonOutputLine(output);
  if (
    !parsed ||
    !hasExactCommandPlanShape(parsed) ||
    parsed.ok !== true ||
    parsed.mode !== "preflight" ||
    parsed.nonExecuting !== true ||
    !Array.isArray(parsed.commands)
  ) {
    return false;
  }

  const seen = new Set();
  const commandsByName = new Map();
  for (const command of parsed.commands) {
    if (
      !command ||
      typeof command.name !== "string" ||
      typeof command.command !== "string" ||
      seen.has(command.name)
    ) {
      return false;
    }
    seen.add(command.name);
    commandsByName.set(command.name, command);
  }

  if (seen.size !== REQUIRED_PREFLIGHT_COMMAND_PLAN_NAMES.size) {
    return false;
  }

  for (const name of REQUIRED_PREFLIGHT_COMMAND_PLAN_NAMES) {
    if (!seen.has(name)) {
      return false;
    }
  }

  if (
    options.expectedTokenEnv !== undefined &&
    !preflightCommandPlanUsesTokenEnv(commandsByName, options.expectedTokenEnv, parsed.safety)
  ) {
    return false;
  }

  return preflightCommandPlanUsesReviewedAuditSummary(commandsByName);
}

function parseCommandPlanCommandsByName(output) {
  if (typeof output !== "string" || output.length === 0 || output.length > OUTPUT_LIMIT_BYTES) {
    return undefined;
  }

  const parsed = parseLastJsonOutputLine(output);
  if (
    !parsed ||
    !hasExactCommandPlanShape(parsed) ||
    parsed.ok !== true ||
    parsed.mode !== "session" ||
    parsed.nonExecuting !== true ||
    !Array.isArray(parsed.commands)
  ) {
    return undefined;
  }

  const seen = new Set();
  const commandsByName = new Map();
  for (const command of parsed.commands) {
    if (
      !command ||
      typeof command.name !== "string" ||
      typeof command.command !== "string" ||
      seen.has(command.name)
    ) {
      return undefined;
    }
    seen.add(command.name);
    commandsByName.set(command.name, command);
  }

  if (seen.size !== REQUIRED_COMMAND_PLAN_NAMES.size) {
    return undefined;
  }

  for (const name of REQUIRED_COMMAND_PLAN_NAMES) {
    if (!seen.has(name)) {
      return undefined;
    }
  }

  return commandsByName;
}

export function parseRoleFilteredCommandReadiness(output, target) {
  if (
    typeof output !== "string" ||
    output.length === 0 ||
    output.length > OUTPUT_LIMIT_BYTES ||
    !ROLE_FILTER_TARGETS.includes(target)
  ) {
    return false;
  }

  return roleFilterMarkersForTarget(target).every((marker) => output.includes(marker)) &&
    roleFilterForbiddenMarkersForTarget(target).every((marker) => !output.includes(marker));
}

export function parseEphemeralBrowserRoleFilteredCommandReadiness(output) {
  if (typeof output !== "string" || output.length === 0 || output.length > OUTPUT_LIMIT_BYTES) {
    return false;
  }

  return roleFilterMarkersForTarget("browser", { ephemeralSurface: true }).every((marker) =>
    output.includes(marker)
  ) &&
    roleFilterForbiddenMarkersForTarget("browser", { ephemeralSurface: true }).every(
      (marker) => !output.includes(marker)
    );
}

export function parseLanRelayRoleFilteredCommandReadiness(output) {
  return (
    parseRoleFilteredCommandReadiness(output, "relay") &&
    output.includes("WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'") &&
    output.includes(`$env:${MVP_READY_TOKEN_ENV_NAME}`) &&
    output.includes("The token value is referenced through the environment") &&
    !output.includes("--token '") &&
    !output.includes("raw-secret-token")
  );
}

export function parseTokenEnvRelayRoleFilteredCommandReadiness(output) {
  return (
    parseRoleFilteredCommandReadiness(output, "relay") &&
    output.includes(`$env:${MVP_READY_TOKEN_ENV_NAME}`) &&
    !output.includes("--token '") &&
    !output.includes("raw-secret-token")
  );
}

export function parseLanAgentRoleFilteredCommandReadiness(output, target) {
  return (
    (target === "host" || target === "viewer") &&
    parseRoleFilteredCommandReadiness(output, target) &&
    output.includes(MVP_READY_LAN_RELAY_URL) &&
    output.includes(`--token $env:${MVP_READY_TOKEN_ENV_NAME}`) &&
    !output.includes("ws://localhost:8787/")
  );
}

export function parseTokenEnvAgentRoleFilteredCommandReadiness(output, target) {
  return (
    (target === "host" || target === "viewer") &&
    parseRoleFilteredCommandReadiness(output, target) &&
    output.includes(`--token $env:${MVP_READY_TOKEN_ENV_NAME}`) &&
    !output.includes("--token '") &&
    !output.includes("--token raw-secret-token")
  );
}

export function parseTokenEnvBrowserRoleFilteredCommandReadiness(output) {
  return (
    parseRoleFilteredCommandReadiness(output, "browser") &&
    output.includes(`$env:${MVP_READY_TOKEN_ENV_NAME}`) &&
    output.includes("The token value is referenced through the environment") &&
    !hasRuntimeTokenArgument(output) &&
    !output.includes("raw-secret-token")
  );
}

export function parseTokenEnvPreflightRoleFilteredCommandReadiness(output) {
  return (
    parseRoleFilteredCommandReadiness(output, "preflight") &&
    output.includes(`$env:${MVP_READY_TOKEN_ENV_NAME}`) &&
    output.includes("The token value is referenced through the environment") &&
    !hasRuntimeTokenArgument(output) &&
    !output.includes("raw-secret-token")
  );
}

function hasRuntimeTokenArgument(output) {
  return /(^|\s)--token(?:\s|=|$)/.test(output);
}

function roleFilterMarkersForTarget(target, options = {}) {
  if (target === "preflight") {
    return [
      "# WinBridge MVP preflight commands",
      "Run each command manually in a visible PowerShell terminal before a two-PC MVP trial.",
      "npm run mvp:ready",
      "npm run mvp:doctor",
      "npm run mvp:native-preflight",
      "npm run mvp:smoke",
      "Safety checks:",
      "This helper printed commands only"
    ];
  }

  const targetMarkers = {
    relay: [
      "# WinBridge MVP relay command",
      "Preflight reminder: run npm run mvp:ready -- --role relay on this machine before a live trial.",
      "Relay URL:",
      "relay command:",
      "npm run dev:relay"
    ],
    host: [
      "# WinBridge MVP host command",
      "Preflight reminder: run npm run mvp:ready -- --role host on this machine before a live trial.",
      "Relay URL:",
      "host command:",
      "npm run dev:agent -- host",
      "--host-consent-prompt 'true'",
      REVIEWED_HOST_CONSENT_TIMEOUT_ARG,
      "--visible-session 'true'",
      "--host-control-prompt 'true'",
      REVIEWED_HOST_CONTROL_SURFACE_ARG,
      "--host-signal-probe-ack 'true'",
      "Host controls:"
    ],
    viewer: [
      "# WinBridge MVP viewer command",
      "Preflight reminder: run npm run mvp:ready -- --role viewer on this machine before a live trial.",
      "Relay URL:",
      "viewer command:",
      "npm run dev:agent -- viewer",
      "--request 'screen:view,input:pointer,input:keyboard'",
      "--request-reason 'MVP remote assistance session'",
      "--viewer-signal-probe-after-ms",
      "--viewer-control-surface-port"
    ],
    browser: [
      "# WinBridge MVP browser command",
      "Preflight reminder: run npm run mvp:ready -- --role viewer on this machine before a live trial.",
      "Relay URL:",
      "browser command:",
      options.ephemeralSurface
        ? EPHEMERAL_VIEWER_SURFACE_BROWSER_INSTRUCTION
        : "Start-Process 'http://127.0.0.1:35987/'",
      "Wait for frame=ready",
      "Click the visible Pointer Off/On control"
    ]
  };

  return [...ROLE_FILTER_SHARED_MARKERS, ...targetMarkers[target]];
}

function roleFilterForbiddenMarkersForTarget(target, options = {}) {
  if (target === "preflight") {
    return [
      "Relay URL:",
      ...ROLE_FILTER_RUNTIME_BLOCK_MARKERS,
      ...ROLE_FILTER_LIVE_COMMAND_MARKERS,
      "--host-apply-input",
      "--host-control-surface-port",
      "windows-capture",
      "--viewer-control-surface-port"
    ];
  }

  return [
    ...ROLE_FILTER_RUNTIME_BLOCK_MARKERS.filter((marker) => marker !== `${target} command:`),
    ...ROLE_FILTER_LIVE_COMMAND_MARKERS.filter((marker) =>
      !roleFilterAllowedLiveMarker(target, marker, options)
    ),
    ...(target === "browser" && options.ephemeralSurface
      ? ["http://127.0.0.1:0/", "Start-Process 'http://127.0.0.1:0/'"]
      : []),
    "# WinBridge MVP preflight commands"
  ];
}

function roleFilterAllowedLiveMarker(target, marker, options = {}) {
  return (
    (target === "relay" && marker === "npm run dev:relay") ||
    (target === "host" && marker === "npm run dev:agent -- host") ||
    (target === "viewer" && marker === "npm run dev:agent -- viewer") ||
    (target === "browser" &&
      !options.ephemeralSurface &&
      marker === "Start-Process 'http://127.0.0.1:35987/'")
  );
}

function hasExactCommandPlanShape(parsed) {
  const keys = Object.keys(parsed);
  return (
    keys.includes("ok") &&
    keys.includes("mode") &&
    keys.includes("nonExecuting") &&
    keys.includes("commands") &&
    keys.every((key) => key === "ok" || key === "mode" || key === "nonExecuting" || key === "commands" || key === "safety") &&
    (!keys.includes("safety") ||
      (Array.isArray(parsed.safety) && parsed.safety.every((item) => typeof item === "string")))
  );
}

function commandPlanUsesRelayUrl(commandsByName, expectedRelayUrl, options = {}) {
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
    commandPlanRelayBindMatches(relayCommand, options.expectedRelayBindHost) &&
    hostCommand.includes(expectedRelayUrl) &&
    viewerCommand.includes(expectedRelayUrl)
  );
}

function commandPlanRelayBindMatches(relayCommand, expectedRelayBindHost) {
  if (expectedRelayBindHost === undefined) {
    return relayCommand.includes("WINBRIDGE_RELAY_BIND_HOST");
  }

  if (expectedRelayBindHost !== "0.0.0.0") {
    return false;
  }

  return relayCommand.includes("$env:WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'");
}

function commandPlanUsesTokenEnv(commandsByName, expectedTokenEnv) {
  if (typeof expectedTokenEnv !== "string" || !/^[A-Z][A-Z0-9_]{0,127}$/.test(expectedTokenEnv)) {
    return false;
  }

  const hostCommand = commandsByName.get("host")?.command;
  const viewerCommand = commandsByName.get("viewer")?.command;
  const allSmokeCommand = commandsByName.get("preflight.ready-all-smoke")?.command;
  const tokenReference = `$env:${expectedTokenEnv}`;

  return (
    typeof hostCommand === "string" &&
    typeof viewerCommand === "string" &&
    typeof allSmokeCommand === "string" &&
    hostCommand.includes(`--token ${tokenReference}`) &&
    viewerCommand.includes(`--token ${tokenReference}`) &&
    allSmokeCommandUsesExpectedTokenEnv(allSmokeCommand, expectedTokenEnv)
  );
}

function commandPlanUsesReviewedHostConsentTimeout(commandsByName) {
  const hostCommand = commandsByName.get("host")?.command;
  return typeof hostCommand === "string" && hostCommandHasReviewedConsentTimeout(hostCommand);
}

function commandPlanUsesReviewedHostControlSurface(commandsByName) {
  const hostCommand = commandsByName.get("host")?.command;
  return typeof hostCommand === "string" && hostCommandHasReviewedControlSurface(hostCommand);
}

function commandPlanUsesReviewedAuditSummary(commandsByName) {
  const auditSummaryCommand = commandsByName.get("preflight.audit-summary")?.command;
  return auditSummaryCommand === REVIEWED_AUDIT_SUMMARY_COMMAND;
}

function preflightCommandPlanUsesReviewedAuditSummary(commandsByName) {
  return commandPlanUsesReviewedAuditSummary(commandsByName);
}

function hostCommandHasReviewedConsentTimeout(hostCommand) {
  return countOccurrences(hostCommand, REVIEWED_HOST_CONSENT_TIMEOUT_ARG) === 1;
}

function hostCommandHasReviewedControlSurface(hostCommand) {
  return countOccurrences(hostCommand, REVIEWED_HOST_CONTROL_SURFACE_ARG) === 1;
}

function countOccurrences(value, needle) {
  if (typeof value !== "string" || needle.length === 0) {
    return 0;
  }

  let count = 0;
  let offset = 0;
  while (true) {
    const index = value.indexOf(needle, offset);
    if (index === -1) {
      return count;
    }
    count += 1;
    offset = index + needle.length;
  }
}

function preflightCommandPlanUsesTokenEnv(commandsByName, expectedTokenEnv, safety) {
  if (typeof expectedTokenEnv !== "string" || !/^[A-Z][A-Z0-9_]{0,127}$/.test(expectedTokenEnv)) {
    return false;
  }

  const allSmokeCommand = commandsByName.get("preflight.ready-all-smoke")?.command;
  if (typeof allSmokeCommand !== "string") {
    return false;
  }

  return (
    commandPlanSafetyUsesTokenEnv(safety, expectedTokenEnv) &&
    allSmokeCommandUsesExpectedTokenEnv(allSmokeCommand, expectedTokenEnv)
  );
}

function allSmokeCommandUsesExpectedTokenEnv(allSmokeCommand, expectedTokenEnv) {
  if (expectedTokenEnv === MVP_READY_TOKEN_ENV_NAME) {
    return allSmokeCommand === "npm run mvp:ready -- --include-all-smoke";
  }

  return allSmokeCommand.includes(
    `$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:${expectedTokenEnv}; npm run mvp:ready -- --include-all-smoke`
  );
}

function commandPlanSafetyUsesTokenEnv(safety, expectedTokenEnv) {
  return (
    Array.isArray(safety) &&
    safety.some(
      (item) =>
        typeof item === "string" &&
        item.includes(`$env:${expectedTokenEnv}`) &&
        item.includes("raw token value is not printed")
    )
  );
}

export function parseSmokeSubchecks(output, options = {}) {
  const result = parseSmokeReadiness(output, options);
  return result?.ok === true ? result.checks : undefined;
}

export function parseSmokeReadiness(output, options = {}) {
  if (typeof output !== "string" || output.length === 0 || output.length > OUTPUT_LIMIT_BYTES) {
    return undefined;
  }

  const parsed = parseLastJsonOutputLine(output);
  if (parsed === undefined) {
    return undefined;
  }

  if (
    !parsed ||
    !hasExactSmokeReadinessShape(parsed) ||
    (parsed.ok !== true && parsed.ok !== false) ||
    !Array.isArray(parsed.checks)
  ) {
    return undefined;
  }

  const expectedOk = parsed.ok === true;
  const expectedSubcheckNames = smokeSubcheckNamesForOptions(options);
  const seen = new Set();
  const subchecks = [];
  for (const check of parsed.checks) {
    if (
      !check ||
      !hasExactSmokeSubcheckShape(check) ||
      typeof check.name !== "string" ||
      !expectedSubcheckNames.has(check.name) ||
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

  if (subchecks.length !== expectedSubcheckNames.size) {
    return undefined;
  }

  if (!expectedOk && !subchecks.some((check) => check.ok === false && !check.skipped)) {
    return undefined;
  }

  const auditSummary =
    expectedOk && "auditSummary" in parsed
      ? parseSmokeAuditSummary(parsed.auditSummary)
      : undefined;
  if (expectedOk && "auditSummary" in parsed && auditSummary === undefined) {
    return undefined;
  }

  return { ok: expectedOk, checks: subchecks, ...(auditSummary ? { auditSummary } : {}) };
}

function smokeSubcheckNamesForOptions(options = {}) {
  return options.windowsInput ? SAFE_WINDOWS_INPUT_SMOKE_SUBCHECK_NAMES : SAFE_SMOKE_SUBCHECK_NAMES;
}

function hasExactSmokeSubcheckShape(check) {
  const keys = Object.keys(check);
  return (
    keys.includes("name") &&
    keys.includes("ok") &&
    keys.every((key) => key === "name" || key === "ok" || key === "skipped")
  );
}

function hasExactSmokeReadinessShape(result) {
  const keys = Object.keys(result);
  if (!keys.includes("ok") || !keys.includes("checks")) {
    return false;
  }

  if (result.ok === true) {
    return (
      keys.every((key) => key === "ok" || key === "checks" || key === "artifacts" || key === "auditSummary") &&
      (!keys.includes("artifacts") || result.artifacts === "cleaned")
    );
  }

  if (result.ok === false) {
    return keys.every((key) => key === "ok" || key === "checks" || key === "reason");
  }

  return false;
}

function formatSmokeSubcheckJson(subcheck) {
  return {
    name: subcheck.name,
    ok: subcheck.ok === true,
    ...(subcheck.skipped ? { skipped: true } : {})
  };
}

function parseSmokeAuditSummary(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const keys = Object.keys(value);
  if (
    keys.length !== SAFE_SMOKE_AUDIT_SUMMARY_ROLES.length ||
    !SAFE_SMOKE_AUDIT_SUMMARY_ROLES.every((role) => keys.includes(role))
  ) {
    return undefined;
  }

  const summary = {};
  for (const role of SAFE_SMOKE_AUDIT_SUMMARY_ROLES) {
    const roleSummary = parseSmokeAuditRoleSummary(value[role]);
    if (!roleSummary) {
      return undefined;
    }
    summary[role] = roleSummary;
  }
  return summary;
}

function parseSmokeAuditRoleSummary(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const expectedKeys = [...SAFE_SMOKE_AUDIT_SUMMARY_COUNTS, ...SAFE_SMOKE_AUDIT_SUMMARY_FLAGS];
  const keys = Object.keys(value);
  if (keys.length !== expectedKeys.length || !expectedKeys.every((key) => keys.includes(key))) {
    return undefined;
  }

  const summary = {};
  for (const key of SAFE_SMOKE_AUDIT_SUMMARY_COUNTS) {
    const count = value[key];
    if (!Number.isSafeInteger(count) || count < 0 || count > 100_000) {
      return undefined;
    }
    summary[key] = count;
  }
  if (summary.accepted + summary.denied + summary.failed !== summary.records) {
    return undefined;
  }
  for (const key of SAFE_SMOKE_AUDIT_SUMMARY_FLAGS) {
    if (typeof value[key] !== "boolean") {
      return undefined;
    }
    summary[key] = value[key];
  }
  return summary;
}

function formatReadyAuditSummaryLines(checkName, summary) {
  const coverage = SAFE_SMOKE_AUDIT_SUMMARY_FLAGS.filter(
    (flag) => summary.host?.[flag] === true || summary.viewer?.[flag] === true
  );
  return [
    formatReadyAuditRoleSummaryLine(checkName, "host", summary.host),
    formatReadyAuditRoleSummaryLine(checkName, "viewer", summary.viewer),
    `${checkName}.audit.coverage=${coverage.length > 0 ? coverage.join(",") : "none"}`
  ];
}

function formatReadyAuditRoleSummaryLine(checkName, role, summary) {
  return `${checkName}.audit.${role}.records=${summary.records} accepted=${summary.accepted} denied=${summary.denied} failed=${summary.failed}`;
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

    const result = runMvpReadyCheck({
      includeSmoke: parsed.includeSmoke,
      includeTokenSmoke: parsed.includeTokenSmoke,
      includeLanTokenSmoke: parsed.includeLanTokenSmoke,
      includeWindowsCaptureSmoke: parsed.includeWindowsCaptureSmoke,
      includeWindowsInputSmoke: parsed.includeWindowsInputSmoke,
      includeWindowsControlSmoke: parsed.includeWindowsControlSmoke,
      includeAllSmoke: parsed.includeAllSmoke,
      role: parsed.role
    });
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
