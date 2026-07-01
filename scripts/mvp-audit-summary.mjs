import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const MVP_AUDIT_SUMMARY_USAGE = [
  "Usage: npm run mvp:audit-summary -- --host logs\\host-audit.jsonl --viewer logs\\viewer-audit.jsonl [--json] [--require-mvp-evidence]",
  "",
  "Reads explicit local host and viewer audit JSONL files after a development",
  "MVP trial and prints bounded evidence metadata only. It does not start",
  "relay, host, viewer, browser, capture, input, services, startup persistence,",
  "network listeners, or unattended access."
].join("\n");

const MAX_AUDIT_SUMMARY_PATH_BYTES = 1024;
const MAX_AUDIT_SUMMARY_FILE_BYTES = 512 * 1024;
const MAX_AUDIT_SUMMARY_LINE_BYTES = 4096;
const MAX_AUDIT_SUMMARY_RECORDS = 5000;
const SAFE_AUDIT_STRING_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/;
const WINDOWS_DEVICE_NAMESPACE_PREFIX = /^[\\/]{2}[.?](?:[\\/]|$)/;
const WINDOWS_RESERVED_DEVICE_NAMES = new Set([
  "AUX",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "CON",
  "CONIN$",
  "CONOUT$",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
  "NUL",
  "PRN"
]);
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
const ROLE_NAMES = Object.freeze(["host", "viewer"]);
const EVIDENCE_FLAGS = Object.freeze([
  "authorizationApproved",
  "authorizationActive",
  "screenFrameSent",
  "screenFrameOutput",
  "inputSent",
  "permissionRevoked",
  "disconnectObserved"
]);
const REQUIRED_MVP_EVIDENCE_BY_ROLE = Object.freeze({
  host: Object.freeze([
    "authorizationApproved",
    "authorizationActive",
    "screenFrameSent",
    "permissionRevoked",
    "disconnectObserved"
  ]),
  viewer: Object.freeze([
    "screenFrameOutput",
    "inputSent",
    "disconnectObserved"
  ])
});
const REQUIRED_ROLE_EVIDENCE = Symbol("requiredRoleMvpEvidence");
const REQUIRED_ACTION_EVIDENCE_BY_ROLE = Object.freeze({
  host: Object.freeze({
    "agent-shell.authorization.approved": "authorizationApproved",
    "agent-shell.authorization.active": "authorizationActive",
    "agent-shell.remote-interaction.screen-frame.sent": "screenFrameSent",
    "agent-shell.permission.revoked": "permissionRevoked",
    "agent-shell.host.disconnect.sent": "disconnectObserved",
    "agent-shell.session.disconnected": "disconnectObserved",
    "agent-shell.lifecycle.terminated": "disconnectObserved",
    "agent-shell.lifecycle.disconnected": "disconnectObserved"
  }),
  viewer: Object.freeze({
    "agent-shell.remote-interaction.screen-frame.output-written": "screenFrameOutput",
    "agent-shell.remote-interaction.input-event.sent": "inputSent",
    "agent-shell.viewer.disconnect.requested": "disconnectObserved",
    "agent-shell.viewer.disconnect.sent": "disconnectObserved"
  })
});
const ACTION_EVIDENCE = Object.freeze({
  "agent-shell.authorization.approved": "authorizationApproved",
  "agent-shell.authorization.active": "authorizationActive",
  "agent-shell.remote-interaction.screen-frame.sent": "screenFrameSent",
  "agent-shell.remote-interaction.screen-frame.output-written": "screenFrameOutput",
  "agent-shell.remote-interaction.input-event.sent": "inputSent",
  "agent-shell.permission.revoked": "permissionRevoked",
  "agent-shell.viewer.disconnect.requested": "disconnectObserved",
  "agent-shell.viewer.disconnect.sent": "disconnectObserved",
  "agent-shell.host.disconnect.sent": "disconnectObserved",
  "agent-shell.session.disconnected": "disconnectObserved",
  "agent-shell.lifecycle.terminated": "disconnectObserved",
  "agent-shell.lifecycle.disconnected": "disconnectObserved"
});
const DISCONNECT_ACTION_PATTERN = /^agent-shell\..*(disconnect|terminated|closed)$/;

export class MvpAuditSummaryUsageError extends Error {
  constructor() {
    super(MVP_AUDIT_SUMMARY_USAGE);
    this.name = "MvpAuditSummaryUsageError";
  }
}

export class MvpAuditSummaryError extends Error {
  constructor(reason) {
    super(reason);
    this.name = "MvpAuditSummaryError";
    this.reason = safeAuditSummaryReason(reason);
  }
}

export function parseMvpAuditSummaryArgs(rawArgs) {
  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }
  if (rawArgs.includes("--help")) {
    throw new MvpAuditSummaryUsageError();
  }

  let hostPath;
  let viewerPath;
  let json = false;
  let requireMvpEvidence = false;
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--json") {
      if (json) {
        throw new MvpAuditSummaryUsageError();
      }
      json = true;
      continue;
    }
    if (arg === "--require-mvp-evidence") {
      if (requireMvpEvidence) {
        throw new MvpAuditSummaryUsageError();
      }
      requireMvpEvidence = true;
      continue;
    }
    if (arg === "--host" || arg === "--viewer") {
      const value = rawArgs[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new MvpAuditSummaryUsageError();
      }
      if (arg === "--host") {
        if (hostPath !== undefined) {
          throw new MvpAuditSummaryUsageError();
        }
        hostPath = parseAuditSummaryPath(value);
      } else {
        if (viewerPath !== undefined) {
          throw new MvpAuditSummaryUsageError();
        }
        viewerPath = parseAuditSummaryPath(value);
      }
      index += 1;
      continue;
    }
    throw new MvpAuditSummaryUsageError();
  }

  if (hostPath === undefined || viewerPath === undefined) {
    throw new MvpAuditSummaryUsageError();
  }

  return { help: false, hostPath, viewerPath, json, requireMvpEvidence };
}

export function runMvpAuditSummaryCheck(options) {
  const readText = options.readText ?? ((path) => readFileSync(path, "utf8"));
  const stat = options.stat ?? statSync;
  const host = readAuditSummaryRole("host", options.hostPath, { readText, stat });
  const viewer = readAuditSummaryRole("viewer", options.viewerPath, { readText, stat });
  const roles = { host, viewer };
  if (options.requireMvpEvidence === true && !hasRequiredMvpEvidence(roles)) {
    throw new MvpAuditSummaryError("missing-required-evidence");
  }

  const result = sanitizeAuditSummaryResult({
    ok: true,
    roles,
    coverage: summarizeCoverage(roles)
  });
  if (!result) {
    throw new MvpAuditSummaryError("malformed-record");
  }
  return result;
}

export function formatMvpAuditSummaryResult(result) {
  const safeResult = sanitizeAuditSummaryResult(result);
  if (!safeResult) {
    return "WinBridge MVP audit summary failed. reason=malformed-record";
  }

  return [
    "WinBridge MVP audit summary passed.",
    formatRoleSummaryLine("host", safeResult.roles.host),
    formatRoleSummaryLine("viewer", safeResult.roles.viewer),
    `audit.coverage=${safeResult.coverage.length > 0 ? safeResult.coverage.join(",") : "none"}`,
    "safety=bounded-metadata-only"
  ].join("\n");
}

export function formatMvpAuditSummaryJsonResult(result) {
  const safeResult = sanitizeAuditSummaryResult(result);
  return JSON.stringify(
    safeResult ?? {
      ok: false,
      reason: "malformed-record"
    }
  );
}

export function formatMvpAuditSummaryError(error) {
  if (error instanceof MvpAuditSummaryUsageError) {
    return MVP_AUDIT_SUMMARY_USAGE;
  }
  return `WinBridge MVP audit summary failed. reason=${safeAuditSummaryReason(error?.reason ?? error?.message)}`;
}

export function formatMvpAuditSummaryJsonError(error) {
  if (error instanceof MvpAuditSummaryUsageError) {
    return JSON.stringify({ ok: false, reason: "usage" });
  }
  return JSON.stringify({
    ok: false,
    reason: safeAuditSummaryReason(error?.reason ?? error?.message)
  });
}

function readAuditSummaryRole(role, auditPath, dependencies) {
  assertAuditSummaryPath(auditPath);

  let stats;
  try {
    stats = dependencies.stat(auditPath);
  } catch {
    throw new MvpAuditSummaryError("file-unreadable");
  }
  if (!stats || typeof stats.size !== "number" || stats.size > MAX_AUDIT_SUMMARY_FILE_BYTES) {
    throw new MvpAuditSummaryError("file-oversized");
  }

  let content;
  try {
    content = dependencies.readText(auditPath);
  } catch {
    throw new MvpAuditSummaryError("file-unreadable");
  }
  return summarizeAuditSummaryContent(role, content);
}

export function summarizeAuditSummaryContent(role, content) {
  if (!ROLE_NAMES.includes(role)) {
    throw new MvpAuditSummaryError("malformed-record");
  }
  if (typeof content !== "string") {
    throw new MvpAuditSummaryError("malformed-jsonl");
  }
  if (Buffer.byteLength(content, "utf8") > MAX_AUDIT_SUMMARY_FILE_BYTES) {
    throw new MvpAuditSummaryError("file-oversized");
  }

  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) {
    throw new MvpAuditSummaryError("malformed-jsonl");
  }
  if (lines.length > MAX_AUDIT_SUMMARY_RECORDS) {
    throw new MvpAuditSummaryError("record-limit-exceeded");
  }

  const summary = createEmptyRoleSummary();
  for (const line of lines) {
    if (Buffer.byteLength(line, "utf8") > MAX_AUDIT_SUMMARY_LINE_BYTES) {
      throw new MvpAuditSummaryError("line-oversized");
    }
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      throw new MvpAuditSummaryError("malformed-jsonl");
    }
    if (!isAuditSummaryRecordLike(record)) {
      throw new MvpAuditSummaryError("malformed-record");
    }
    if (hasSecretBearingAuditAction(record.action)) {
      throw new MvpAuditSummaryError("unsafe-audit-metadata");
    }

    summary.records += 1;
    summary[record.outcome] += 1;
    const evidence = actionEvidenceFlag(record.action, record.outcome);
    if (evidence) {
      summary[evidence] = true;
    }
    const requiredEvidence = roleRequiredEvidenceFlag(role, record.action, record.outcome);
    if (requiredEvidence) {
      summary[REQUIRED_ROLE_EVIDENCE][requiredEvidence] = true;
    }
  }

  return summary;
}

function parseAuditSummaryPath(raw) {
  try {
    assertAuditSummaryPath(raw);
    return raw;
  } catch {
    throw new MvpAuditSummaryUsageError();
  }
}

function assertAuditSummaryPath(value) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value !== value.trim() ||
    Buffer.byteLength(value, "utf8") > MAX_AUDIT_SUMMARY_PATH_BYTES ||
    hasAsciiControlCharacter(value) ||
    hasUnsafeFormatCharacter(value) ||
    WINDOWS_DEVICE_NAMESPACE_PREFIX.test(value) ||
    hasWindowsReservedDevicePathSegment(value) ||
    hasWindowsAlternateDataStreamPathSegment(value)
  ) {
    throw new MvpAuditSummaryError("unsafe-path");
  }
}

function isAuditSummaryRecordLike(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const allowedKeys = new Set([
    "eventId",
    "timestamp",
    "actor",
    "action",
    "outcome",
    "reason",
    "sessionId",
    "target",
    "detail"
  ]);
  if (!Object.keys(value).every((key) => allowedKeys.has(key))) {
    return false;
  }

  return (
    isSafeAuditString(value.eventId, 8, 160) &&
    isIsoTimestamp(value.timestamp) &&
    isSafeAuditString(value.action, 1, 160) &&
    ["accepted", "denied", "failed"].includes(value.outcome) &&
    isAuditActorLike(value.actor) &&
    (value.reason === undefined || isSafeAuditString(value.reason, 1, 160)) &&
    (value.sessionId === undefined || isSafeAuditString(value.sessionId, 3, 160)) &&
    (value.target === undefined || isAuditTargetLike(value.target)) &&
    (value.detail === undefined ||
      (value.detail !== null && typeof value.detail === "object" && !Array.isArray(value.detail)))
  );
}

function isAuditActorLike(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value);
  return (
    keys.includes("type") &&
    keys.includes("id") &&
    keys.every((key) => key === "type" || key === "id" || key === "deviceId") &&
    ["host", "viewer", "relay", "system"].includes(value.type) &&
    isSafeAuditString(value.id, 1, 160) &&
    (value.deviceId === undefined || isSafeAuditString(value.deviceId, 1, 160))
  );
}

function isAuditTargetLike(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value);
  return (
    keys.includes("type") &&
    keys.every((key) => key === "type" || key === "id") &&
    isSafeAuditString(value.type, 1, 160) &&
    (value.id === undefined || isSafeAuditString(value.id, 1, 160))
  );
}

function isSafeAuditString(value, minLength, maxLength) {
  return (
    typeof value === "string" &&
    value.length >= minLength &&
    value.length <= maxLength &&
    value === value.trim() &&
    SAFE_AUDIT_STRING_PATTERN.test(value) &&
    !hasSecretBearingMetadata(value)
  );
}

function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function actionEvidenceFlag(action, outcome) {
  if (outcome !== "accepted") {
    return undefined;
  }

  return ACTION_EVIDENCE[action] ?? (DISCONNECT_ACTION_PATTERN.test(action) ? "disconnectObserved" : undefined);
}

function createEmptyRoleSummary() {
  const summary = {
    records: 0,
    accepted: 0,
    denied: 0,
    failed: 0,
    authorizationApproved: false,
    authorizationActive: false,
    screenFrameSent: false,
    screenFrameOutput: false,
    inputSent: false,
    permissionRevoked: false,
    disconnectObserved: false
  };
  Object.defineProperty(summary, REQUIRED_ROLE_EVIDENCE, {
    value: createEmptyEvidencePresence(),
    enumerable: false
  });
  return summary;
}

function createEmptyEvidencePresence() {
  return Object.fromEntries(EVIDENCE_FLAGS.map((flag) => [flag, false]));
}

function roleRequiredEvidenceFlag(role, action, outcome) {
  if (outcome !== "accepted") {
    return undefined;
  }
  return REQUIRED_ACTION_EVIDENCE_BY_ROLE[role]?.[action];
}

function summarizeCoverage(roles) {
  return EVIDENCE_FLAGS.filter(
    (flag) => roles.host[flag] === true || roles.viewer[flag] === true
  );
}

function hasRequiredMvpEvidence(roles) {
  return (
    requiredRoleEvidencePresent(roles.host?.[REQUIRED_ROLE_EVIDENCE], REQUIRED_MVP_EVIDENCE_BY_ROLE.host) &&
    requiredRoleEvidencePresent(roles.viewer?.[REQUIRED_ROLE_EVIDENCE], REQUIRED_MVP_EVIDENCE_BY_ROLE.viewer)
  );
}

function requiredRoleEvidencePresent(summary, requiredFlags) {
  return requiredFlags.every((flag) => summary?.[flag] === true);
}

function sanitizeAuditSummaryResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result) || result.ok !== true) {
    return undefined;
  }
  const host = sanitizeRoleSummary(result.roles?.host);
  const viewer = sanitizeRoleSummary(result.roles?.viewer);
  if (!host || !viewer || !Array.isArray(result.coverage)) {
    return undefined;
  }
  const coverage = result.coverage.filter((flag, index, flags) =>
    EVIDENCE_FLAGS.includes(flag) && flags.indexOf(flag) === index
  );
  return {
    ok: true,
    roles: { host, viewer },
    coverage
  };
}

function sanitizeRoleSummary(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const summary = {};
  for (const key of ["records", "accepted", "denied", "failed"]) {
    if (!Number.isInteger(value[key]) || value[key] < 0 || value[key] > MAX_AUDIT_SUMMARY_RECORDS) {
      return undefined;
    }
    summary[key] = value[key];
  }
  if (summary.records !== summary.accepted + summary.denied + summary.failed) {
    return undefined;
  }
  for (const flag of EVIDENCE_FLAGS) {
    summary[flag] = value[flag] === true;
  }
  return summary;
}

function formatRoleSummaryLine(role, summary) {
  return `audit.${role}.records=${summary.records} accepted=${summary.accepted} denied=${summary.denied} failed=${summary.failed}`;
}

function safeAuditSummaryReason(reason) {
  return FAILURE_REASONS.has(reason) ? reason : "malformed-record";
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

function hasWindowsReservedDevicePathSegment(path) {
  return path.split(/[\\/]+/).some((segment) => {
    const deviceName = windowsDeviceNameFromPathSegment(segment);
    return deviceName !== "" && WINDOWS_RESERVED_DEVICE_NAMES.has(deviceName);
  });
}

function windowsDeviceNameFromPathSegment(segment) {
  const withoutDrivePrefix = segment.replace(/^[A-Za-z]:/, "");
  const withoutStreamName = withoutDrivePrefix.split(":")[0] ?? "";
  const baseName = withoutStreamName.split(".")[0] ?? "";
  return baseName.replace(/[ .]+$/g, "").toUpperCase();
}

function hasWindowsAlternateDataStreamPathSegment(path) {
  return path.split(/[\\/]+/).some((segment, index) => {
    if (segment === "") {
      return false;
    }
    if (index === 0 && /^[A-Za-z]:$/.test(segment)) {
      return false;
    }
    return segment.includes(":");
  });
}

function hasSecretBearingAuditAction(action) {
  return hasSecretBearingMetadata(action);
}

function hasSecretBearingMetadata(value) {
  return /(^|[._:\-/\\])(token|credential|credentials|password|passphrase|secret|api[-_:.]?key|access[-_:.]?key|cookie|private[-_:.]?key|ssh[-_:.]?key|authorization[-_:.]?header|auth[-_:.]?header|proxy[-_:.]?authorization|pairing[-_:.]?code|keystroke|keylog|screenshot|screen[-_:.]?content|screen[-_:.]?data|clipboard|file[-_:.]?content|file[-_:.]?bytes|diagnostic[-_:.]?dump)([=._:\-/\\]|$)/i.test(
    value
  );
}

function runCli(rawArgs = process.argv.slice(2), streams = process) {
  try {
    const parsed = parseMvpAuditSummaryArgs(rawArgs);
    if (parsed.help) {
      streams.stdout.write(`${MVP_AUDIT_SUMMARY_USAGE}\n`);
      return 0;
    }
    const result = runMvpAuditSummaryCheck(parsed);
    streams.stdout.write(
      `${parsed.json ? formatMvpAuditSummaryJsonResult(result) : formatMvpAuditSummaryResult(result)}\n`
    );
    return 0;
  } catch (error) {
    const wantsJson = rawArgs.includes("--json");
    streams.stderr.write(
      `${wantsJson ? formatMvpAuditSummaryJsonError(error) : formatMvpAuditSummaryError(error)}\n`
    );
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runCli();
}
