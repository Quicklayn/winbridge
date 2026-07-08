import { fileURLToPath } from "node:url";
import {
  MvpAuditSummaryUsageError,
  parseMvpAuditSummaryArgs,
  runMvpAuditSummaryCheck
} from "./mvp-audit-summary.mjs";

export const MVP_TRIAL_USAGE = [
  "Usage: npm run mvp:trial -- [--json] [--role relay|host|viewer|evidence]",
  "       npm run mvp:trial -- --evidence --host-audit logs\\host-audit.jsonl --viewer-audit logs\\viewer-audit.jsonl [--json]",
  "",
  "Prints a bounded, non-executing two-PC MVP trial workflow, or verifies",
  "explicit local host/viewer audit logs through the strict MVP evidence gate.",
  "It does not start relay, host, viewer, browser, capture, input, services,",
  "startup persistence, network listeners, or unattended access."
].join("\n");

const TRIAL_ROLES = Object.freeze(["relay", "host", "viewer", "evidence"]);
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
        command:
          "npm run mvp:commands -- --only relay --relay-host <relay-pc-lan-ip> --token-env WINBRIDGE_RELAY_SHARED_TOKEN"
      }),
      Object.freeze({
        name: "operator-check",
        command: "Run the printed relay command in a visible PowerShell terminal."
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
        command:
          "npm run mvp:commands -- --only host --relay-host <relay-pc-lan-ip> --token-env WINBRIDGE_RELAY_SHARED_TOKEN"
      }),
      Object.freeze({
        name: "operator-check",
        command:
          "Approve only the visible host consent prompt; keep pause, revoke, terminate, and disconnect controls available."
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
        command:
          "npm run mvp:commands -- --only viewer --relay-host <relay-pc-lan-ip> --token-env WINBRIDGE_RELAY_SHARED_TOKEN"
      }),
      Object.freeze({
        name: "print-browser-command",
        command:
          "npm run mvp:commands -- --only browser --relay-host <relay-pc-lan-ip> --token-env WINBRIDGE_RELAY_SHARED_TOKEN"
      }),
      Object.freeze({
        name: "operator-check",
        command:
          "Open the loopback viewer surface only after the viewer command reports readiness."
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
      if (role !== undefined || value === undefined || value.startsWith("--") || !TRIAL_ROLES.includes(value)) {
        throw new MvpTrialUsageError();
      }
      role = value;
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
    if (role !== undefined || hostAudit === undefined || viewerAudit === undefined) {
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
    role
  };
}

export function createMvpTrialPlan(options = {}) {
  const roles = options.role ? [options.role] : TRIAL_ROLES;
  return {
    ok: true,
    mode: "plan",
    nonExecuting: true,
    roles: roles.map((role) => TRIAL_SECTIONS[role]),
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
    ? JSON.stringify({ ok: false, reason })
    : `WinBridge two-PC MVP trial failed. reason=${reason}`;
}

function formatTrialSection(section) {
  return [
    "",
    `[${section.role}] ${section.title}`,
    ...section.steps.map((step) => `${step.name}: ${step.command}`)
  ];
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
    !TRIAL_ROLES.includes(section.role) ||
    section !== TRIAL_SECTIONS[section.role] ||
    !Array.isArray(section.steps)
  ) {
    return undefined;
  }
  return {
    role: section.role,
    title: section.title,
    steps: section.steps.map((step) => ({ name: step.name, command: step.command }))
  };
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
