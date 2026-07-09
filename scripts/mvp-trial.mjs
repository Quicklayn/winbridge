import { fileURLToPath } from "node:url";
import {
  MvpAuditSummaryUsageError,
  parseMvpAuditSummaryArgs,
  runMvpAuditSummaryCheck
} from "./mvp-audit-summary.mjs";

export const MVP_TRIAL_USAGE = [
  "Usage: npm run mvp:trial -- [--json] [--role relay|host|viewer|evidence] [--relay-host RELAY-PC-LAN-IP]",
  "       npm run mvp:trial -- --evidence --host-audit logs\\host-audit.jsonl --viewer-audit logs\\viewer-audit.jsonl [--json]",
  "",
  "Prints a bounded, non-executing two-PC MVP trial workflow, or verifies",
  "explicit local host/viewer audit logs through the strict MVP evidence gate.",
  "It does not start relay, host, viewer, browser, capture, input, services,",
  "startup persistence, network listeners, or unattended access."
].join("\n");

const TRIAL_SCOPED_ROLES = Object.freeze(["relay", "host", "viewer", "evidence"]);
const TRIAL_FULL_ROLES = Object.freeze(["preflight", ...TRIAL_SCOPED_ROLES]);
const RELAY_HOST_PLACEHOLDER = "<relay-pc-lan-ip>";
const SESSION_ID_PLACEHOLDER = "<session-id>";
const PAIRING_CODE_PLACEHOLDER = "<pairing-code>";
const RELAY_HOST_SHORTCUT_PATTERN =
  /^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
const IPV4_LITERAL_PATTERN = /^\d{1,3}(?:\.\d{1,3}){3}$/;
const SECRET_MARKER_PATTERN =
  /(^|[._:\-/\\])(token|credential|credentials|password|passphrase|secret|api[-_:.]?key|access[-_:.]?key|cookie|private[-_:.]?key|ssh[-_:.]?key|authorization|auth[-_:.]?header|proxy[-_:.]?authorization)([=._:\-/\\]|$)/i;
const FAILURE_REASONS = new Set([
  "usage",
  "unsafe-path",
  "file-unreadable",
  "file-oversized",
  "line-oversized",
  "record-limit-exceeded",
  "malformed-jsonl",
  "malformed-record",
  "unsafe-audit-metadata",
  "missing-required-evidence"
]);

const PLAN_SAFETY = Object.freeze([
  "host-consent-required",
  "host-visible-session-required",
  "host-can-pause-revoke-disconnect",
  "strict-audit-evidence-required",
  "plan-is-non-executing"
]);

const TRIAL_SECTIONS = Object.freeze({
  preflight: Object.freeze({
    role: "preflight",
    title: "Preflight dry run",
    steps: Object.freeze([
      Object.freeze({
        name: "session-bootstrap",
        command: trialSessionBootstrapCommandReference()
      }),
      Object.freeze({
        name: "evidence-fixture",
        command: "npm run mvp:ready -- --include-evidence-fixture"
      }),
      Object.freeze({
        name: "operator-check",
        command:
          "This generated local fixture dry run proves strict evidence gate wiring only; live trial proof still requires post-run role-bound evidence."
      })
    ])
  }),
  relay: Object.freeze({
    role: "relay",
    title: "Relay PC",
    steps: Object.freeze([
      Object.freeze({
        name: "readiness",
        command: "npm run mvp:ready -- --role relay"
      }),
      Object.freeze({
        name: "print-command",
        command: trialRelayHostCommandReference("relay")
      }),
      Object.freeze({
        name: "run-role",
        command: trialRoleRunnerCommandReference("relay")
      }),
      Object.freeze({
        name: "operator-check",
        command:
          "Replace the session and pairing placeholders from preflight, then run the relay role in a visible PowerShell terminal."
      })
    ])
  }),
  host: Object.freeze({
    role: "host",
    title: "Host PC",
    steps: Object.freeze([
      Object.freeze({
        name: "readiness",
        command: "npm run mvp:ready -- --role host"
      }),
      Object.freeze({
        name: "print-command",
        command: trialRelayHostCommandReference("host")
      }),
      Object.freeze({
        name: "lan-probe",
        command: trialLanProbeCommandReference("host")
      }),
      Object.freeze({
        name: "run-role",
        command: trialRoleRunnerCommandReference("host")
      }),
      Object.freeze({
        name: "operator-check",
        command:
          "Replace the session and pairing placeholders from preflight, approve only the visible host consent prompt, and keep pause, revoke, terminate, and disconnect controls available."
      })
    ])
  }),
  viewer: Object.freeze({
    role: "viewer",
    title: "Viewer PC",
    steps: Object.freeze([
      Object.freeze({
        name: "readiness",
        command: "npm run mvp:ready -- --role viewer"
      }),
      Object.freeze({
        name: "print-viewer-command",
        command: trialRelayHostCommandReference("viewer")
      }),
      Object.freeze({
        name: "print-browser-command",
        command: trialRelayHostCommandReference("browser")
      }),
      Object.freeze({
        name: "lan-probe",
        command: trialLanProbeCommandReference("viewer")
      }),
      Object.freeze({
        name: "run-role",
        command: trialRoleRunnerCommandReference("viewer")
      }),
      Object.freeze({
        name: "operator-check",
        command:
          "Replace the session and pairing placeholders from preflight, then open the loopback viewer surface only after the viewer command reports readiness."
      })
    ])
  }),
  evidence: Object.freeze({
    role: "evidence",
    title: "Post-run evidence",
    steps: Object.freeze([
      Object.freeze({
        name: "strict-evidence",
        command:
          "npm run mvp:trial -- --evidence --host-audit <host-audit-jsonl> --viewer-audit <viewer-audit-jsonl>"
      }),
      Object.freeze({
        name: "underlying-gate",
        command:
          "npm run mvp:audit-summary -- --host <host-audit-jsonl> --viewer <viewer-audit-jsonl> --require-mvp-evidence"
      }),
      Object.freeze({
        name: "operator-check",
        command:
          "Treat the two-PC MVP trial as unproven until strict role-bound evidence passes."
      })
    ])
  })
});

export class MvpTrialUsageError extends Error {
  constructor() {
    super(MVP_TRIAL_USAGE);
    this.name = "MvpTrialUsageError";
  }
}

export function parseMvpTrialArgs(rawArgs) {
  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }
  if (rawArgs.includes("--help")) {
    throw new MvpTrialUsageError();
  }

  let json = false;
  let role;
  let evidence = false;
  let hostAudit;
  let viewerAudit;
  let relayHost;

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--json") {
      if (json) {
        throw new MvpTrialUsageError();
      }
      json = true;
      continue;
    }
    if (arg === "--evidence") {
      if (evidence) {
        throw new MvpTrialUsageError();
      }
      evidence = true;
      continue;
    }
    if (arg === "--role") {
      const value = rawArgs[index + 1];
      if (
        role !== undefined ||
        value === undefined ||
        value.startsWith("--") ||
        !TRIAL_SCOPED_ROLES.includes(value)
      ) {
        throw new MvpTrialUsageError();
      }
      role = value;
      index += 1;
      continue;
    }
    if (arg === "--relay-host") {
      const value = rawArgs[index + 1];
      if (relayHost !== undefined || value === undefined || value.startsWith("--")) {
        throw new MvpTrialUsageError();
      }
      relayHost = parseTrialRelayHost(value);
      index += 1;
      continue;
    }
    if (arg === "--host-audit" || arg === "--viewer-audit") {
      const value = rawArgs[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new MvpTrialUsageError();
      }
      if (arg === "--host-audit") {
        if (hostAudit !== undefined) {
          throw new MvpTrialUsageError();
        }
        hostAudit = value;
      } else {
        if (viewerAudit !== undefined) {
          throw new MvpTrialUsageError();
        }
        viewerAudit = value;
      }
      index += 1;
      continue;
    }
    throw new MvpTrialUsageError();
  }

  if (evidence) {
    if (role !== undefined || relayHost !== undefined || hostAudit === undefined || viewerAudit === undefined) {
      throw new MvpTrialUsageError();
    }
    const parsedAudit = parseMvpAuditSummaryArgs([
      "--host",
      hostAudit,
      "--viewer",
      viewerAudit,
      "--require-mvp-evidence"
    ]);
    return {
      help: false,
      mode: "evidence",
      json,
      hostPath: parsedAudit.hostPath,
      viewerPath: parsedAudit.viewerPath
    };
  }

  if (hostAudit !== undefined || viewerAudit !== undefined) {
    throw new MvpTrialUsageError();
  }

  return {
    help: false,
    mode: "plan",
    json,
    role,
    ...(relayHost ? { relayHost } : {})
  };
}

export function createMvpTrialPlan(options = {}) {
  const roles = options.role ? [options.role] : TRIAL_FULL_ROLES;
  return {
    ok: true,
    mode: "plan",
    nonExecuting: true,
    roles: roles.map((role) => createTrialSection(role, options.relayHost)),
    safety: [...PLAN_SAFETY]
  };
}

export function runMvpTrialEvidence(options) {
  const result = runMvpAuditSummaryCheck({
    hostPath: options.hostPath,
    viewerPath: options.viewerPath,
    requireMvpEvidence: true,
    readText: options.readText,
    stat: options.stat
  });
  return {
    ok: true,
    mode: "evidence",
    evidence: result,
    safety: ["strict-audit-evidence-required", "bounded-metadata-only"]
  };
}

export function formatMvpTrialPlan(plan) {
  const safePlan = sanitizeTrialPlan(plan);
  if (!safePlan) {
    return "WinBridge two-PC MVP trial failed. reason=malformed-record";
  }

  return [
    "WinBridge two-PC MVP trial workflow.",
    "mode=plan nonExecuting=true",
    ...safePlan.roles.flatMap((section) => formatTrialSection(section)),
    `safety=${safePlan.safety.join(",")}`
  ].join("\n");
}

export function formatMvpTrialPlanJson(plan) {
  return JSON.stringify(
    sanitizeTrialPlan(plan) ?? {
      ok: false,
      reason: "malformed-record"
    }
  );
}

export function formatMvpTrialEvidenceResult(result) {
  const safeResult = sanitizeEvidenceResult(result);
  if (!safeResult) {
    return "WinBridge two-PC MVP trial failed. reason=malformed-record";
  }

  return [
    "WinBridge two-PC MVP trial evidence passed.",
    `audit.host.records=${safeResult.evidence.roles.host.records} accepted=${safeResult.evidence.roles.host.accepted} denied=${safeResult.evidence.roles.host.denied} failed=${safeResult.evidence.roles.host.failed}`,
    `audit.viewer.records=${safeResult.evidence.roles.viewer.records} accepted=${safeResult.evidence.roles.viewer.accepted} denied=${safeResult.evidence.roles.viewer.denied} failed=${safeResult.evidence.roles.viewer.failed}`,
    `audit.coverage=${safeResult.evidence.coverage.length > 0 ? safeResult.evidence.coverage.join(",") : "none"}`,
    "safety=bounded-metadata-only"
  ].join("\n");
}

export function formatMvpTrialEvidenceJsonResult(result) {
  return JSON.stringify(
    sanitizeEvidenceResult(result) ?? {
      ok: false,
      reason: "malformed-record"
    }
  );
}

export function formatMvpTrialError(error, options = {}) {
  if (error instanceof MvpTrialUsageError || error instanceof MvpAuditSummaryUsageError) {
    return options.json ? JSON.stringify({ ok: false, reason: "usage" }) : MVP_TRIAL_USAGE;
  }
  const reason = safeTrialReason(error?.reason ?? error?.message);
  return options.json
    ? JSON.stringify({ ok: false, reason, ...formatMissingEvidenceJson(reason, error?.missingEvidence) })
    : [
        `WinBridge two-PC MVP trial failed. reason=${reason}`,
        ...formatMissingEvidenceLines(reason, error?.missingEvidence)
      ].join("\n");
}

function formatTrialSection(section) {
  return [
    "",
    `[${section.role}] ${section.title}`,
    ...section.steps.map((step) => `${step.name}: ${step.command}`)
  ];
}

function createTrialSection(role, relayHost) {
  const base = TRIAL_SECTIONS[role];
  return {
    role: base.role,
    title: base.title,
    steps: base.steps.map((step) => ({
      name: step.name,
      command: relayHost ? step.command.replaceAll(RELAY_HOST_PLACEHOLDER, relayHost) : step.command
    }))
  };
}

function sanitizeTrialPlan(plan) {
  if (
    !plan ||
    typeof plan !== "object" ||
    Array.isArray(plan) ||
    plan.ok !== true ||
    plan.mode !== "plan" ||
    plan.nonExecuting !== true ||
    !Array.isArray(plan.roles) ||
    !Array.isArray(plan.safety)
  ) {
    return undefined;
  }

  const roles = [];
  const seenRoles = new Set();
  for (const section of plan.roles) {
    const safeSection = sanitizeSection(section);
    if (!safeSection || seenRoles.has(safeSection.role)) {
      return undefined;
    }
    seenRoles.add(safeSection.role);
    roles.push(safeSection);
  }

  const safety = plan.safety.filter(
    (item, index, items) => PLAN_SAFETY.includes(item) && items.indexOf(item) === index
  );
  return {
    ok: true,
    mode: "plan",
    nonExecuting: true,
    roles,
    safety
  };
}

function sanitizeSection(section) {
  if (
    !section ||
    typeof section !== "object" ||
    Array.isArray(section) ||
    !TRIAL_FULL_ROLES.includes(section.role) ||
    !Array.isArray(section.steps)
  ) {
    return undefined;
  }
  const reviewed = TRIAL_SECTIONS[section.role];
  if (section.title !== reviewed.title || section.steps.length !== reviewed.steps.length) {
    return undefined;
  }
  for (let index = 0; index < section.steps.length; index += 1) {
    if (!isReviewedTrialStep(section.steps[index], reviewed.steps[index])) {
      return undefined;
    }
  }
  return {
    role: section.role,
    title: section.title,
    steps: section.steps.map((step) => ({ name: step.name, command: step.command }))
  };
}

function isReviewedTrialStep(step, reviewed) {
  if (
    !step ||
    typeof step !== "object" ||
    Array.isArray(step) ||
    step.name !== reviewed.name ||
    typeof step.command !== "string"
  ) {
    return false;
  }
  return step.command === reviewed.command || isReviewedRelayHostCommandReference(step.command, reviewed.command);
}

function isReviewedRelayHostCommandReference(command, reviewedCommand) {
  if (!reviewedCommand.includes(RELAY_HOST_PLACEHOLDER)) {
    return false;
  }
  const [prefix, suffix] = reviewedCommand.split(RELAY_HOST_PLACEHOLDER);
  if (!command.startsWith(prefix) || !command.endsWith(suffix)) {
    return false;
  }
  const relayHost = command.slice(prefix.length, command.length - suffix.length);
  try {
    parseTrialRelayHost(relayHost);
    return true;
  } catch {
    return false;
  }
}

function sanitizeEvidenceResult(result) {
  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result) ||
    result.ok !== true ||
    result.mode !== "evidence" ||
    !result.evidence ||
    result.evidence.ok !== true ||
    !Array.isArray(result.evidence.coverage)
  ) {
    return undefined;
  }
  return result;
}

function safeTrialReason(reason) {
  return FAILURE_REASONS.has(reason) ? reason : "malformed-record";
}

function sanitizeMissingEvidence(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const allowed = new Set([
    "host.authorizationApproved",
    "host.authorizationActive",
    "host.screenFrameSent",
    "host.permissionRevoked",
    "host.disconnectObserved",
    "viewer.screenFrameOutput",
    "viewer.inputSent",
    "viewer.disconnectObserved"
  ]);
  return [...allowed].filter((item) => value.includes(item));
}

function formatMissingEvidenceLines(reason, missingEvidence) {
  const safeMissingEvidence = sanitizeMissingEvidence(missingEvidence);
  if (reason !== "missing-required-evidence" || safeMissingEvidence.length === 0) {
    return [];
  }
  return [`missingEvidence=${safeMissingEvidence.join(",")}`];
}

function formatMissingEvidenceJson(reason, missingEvidence) {
  const safeMissingEvidence = sanitizeMissingEvidence(missingEvidence);
  if (reason !== "missing-required-evidence" || safeMissingEvidence.length === 0) {
    return {};
  }
  return { missingEvidence: safeMissingEvidence };
}

function trialRelayHostCommandReference(target) {
  return `npm run mvp:commands -- --only ${target} --relay-host ${RELAY_HOST_PLACEHOLDER} --token-env WINBRIDGE_RELAY_SHARED_TOKEN`;
}

function trialSessionBootstrapCommandReference() {
  return `npm run mvp:commands -- --generate-session --generate-pairing --relay-host ${RELAY_HOST_PLACEHOLDER} --token-env WINBRIDGE_RELAY_SHARED_TOKEN`;
}

function trialLanProbeCommandReference(role) {
  return `npm run mvp:lan-probe -- --role ${role} --relay-host ${RELAY_HOST_PLACEHOLDER} --session ${SESSION_ID_PLACEHOLDER} --pairing ${PAIRING_CODE_PLACEHOLDER} --peer ${role}-probe --device ${role}-device --token-env WINBRIDGE_RELAY_SHARED_TOKEN`;
}

function trialRoleRunnerCommandReference(role) {
  return `npm run mvp:run -- --role ${role} --session ${SESSION_ID_PLACEHOLDER} --pairing ${PAIRING_CODE_PLACEHOLDER} --relay-host ${RELAY_HOST_PLACEHOLDER} --token-env WINBRIDGE_RELAY_SHARED_TOKEN --i-understand-foreground`;
}

function parseTrialRelayHost(raw) {
  if (
    isUnsafeScalar(raw) ||
    !RELAY_HOST_SHORTCUT_PATTERN.test(raw) ||
    hasSecretBearingMetadata(raw) ||
    isLoopbackOrUnspecifiedRelayHost(raw)
  ) {
    throw new MvpTrialUsageError();
  }

  if (IPV4_LITERAL_PATTERN.test(raw)) {
    const parts = raw.split(".").map((part) => Number.parseInt(part, 10));
    if (parts.some((part) => part > 255)) {
      throw new MvpTrialUsageError();
    }
  }

  return raw;
}

function isUnsafeScalar(raw) {
  return (
    typeof raw !== "string" ||
    raw.trim().length === 0 ||
    raw !== raw.trim() ||
    hasAsciiControlCharacter(raw) ||
    hasUnsafeFormatCharacter(raw)
  );
}

function hasAsciiControlCharacter(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127) {
      return true;
    }
  }

  return false;
}

function hasUnsafeFormatCharacter(value) {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (
      codePoint === 0x061c ||
      codePoint === 0x200b ||
      codePoint === 0x200c ||
      codePoint === 0x200d ||
      codePoint === 0x200e ||
      codePoint === 0x200f ||
      codePoint === 0x2060 ||
      codePoint === 0xfeff ||
      (codePoint !== undefined && codePoint >= 0x202a && codePoint <= 0x202e) ||
      (codePoint !== undefined && codePoint >= 0x2066 && codePoint <= 0x2069)
    ) {
      return true;
    }
  }

  return false;
}

function hasSecretBearingMetadata(raw) {
  return SECRET_MARKER_PATTERN.test(raw);
}

function isLoopbackOrUnspecifiedRelayHost(raw) {
  const host = raw.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host === "0.0.0.0") {
    return true;
  }

  if (IPV4_LITERAL_PATTERN.test(host)) {
    const [first] = host.split(".");
    return first === "127";
  }

  return false;
}

function runCli(rawArgs = process.argv.slice(2), streams = process) {
  let wantsJson = rawArgs.includes("--json");
  try {
    const parsed = parseMvpTrialArgs(rawArgs);
    wantsJson = parsed.json === true;
    if (parsed.help) {
      streams.stdout.write(`${MVP_TRIAL_USAGE}\n`);
      return 0;
    }

    if (parsed.mode === "evidence") {
      const result = runMvpTrialEvidence(parsed);
      streams.stdout.write(
        `${parsed.json ? formatMvpTrialEvidenceJsonResult(result) : formatMvpTrialEvidenceResult(result)}\n`
      );
      return 0;
    }

    const plan = createMvpTrialPlan(parsed);
    streams.stdout.write(`${parsed.json ? formatMvpTrialPlanJson(plan) : formatMvpTrialPlan(plan)}\n`);
    return 0;
  } catch (error) {
    streams.stderr.write(`${formatMvpTrialError(error, { json: wantsJson })}\n`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runCli();
}
