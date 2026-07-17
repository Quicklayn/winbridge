import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseMvpAuditSummaryArgs,
  runMvpAuditSummaryCheck
} from "./mvp-audit-summary.mjs";

export const DEFAULT_MVP_EVIDENCE_FIXTURE_HOST_PATH = join(
  tmpdir(),
  "winbridge-mvp-evidence-fixture",
  "host-audit.jsonl"
);
export const DEFAULT_MVP_EVIDENCE_FIXTURE_VIEWER_PATH = join(
  tmpdir(),
  "winbridge-mvp-evidence-fixture",
  "viewer-audit.jsonl"
);
export const DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID = "fixture-session";

export const MVP_EVIDENCE_FIXTURE_USAGE = [
  "Usage: npm run mvp:evidence-fixture -- [--host logs\\fixture-host.jsonl] [--viewer logs\\fixture-viewer.jsonl] [--session <session-id>] [--verify] [--json]",
  "",
  "Writes generated local MVP audit fixture JSONL files for dry-running the",
  "strict evidence gate. Fixtures are not proof of a live two-PC session."
].join("\n");

const FAILURE_REASONS = new Set(["usage", "unsafe-path", "write-failed", "verify-failed"]);
const HOST_FIXTURE_RECORD_COUNT = 9;
const VIEWER_FIXTURE_RECORD_COUNT = 4;
const FIXTURE_AUTHORIZATION_ID = "fixtureauth";
const FIXTURE_FRAME_ID = "fixtureframe";
const FIXTURE_INPUT_EVENT_ID = "fixtureinput";

export class MvpEvidenceFixtureUsageError extends Error {
  constructor() {
    super(MVP_EVIDENCE_FIXTURE_USAGE);
    this.name = "MvpEvidenceFixtureUsageError";
    this.reason = "usage";
  }
}

export class MvpEvidenceFixtureError extends Error {
  constructor(reason) {
    super(reason);
    this.name = "MvpEvidenceFixtureError";
    this.reason = safeEvidenceFixtureReason(reason);
  }
}

export function parseMvpEvidenceFixtureArgs(rawArgs) {
  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }
  if (rawArgs.includes("--help")) {
    throw new MvpEvidenceFixtureUsageError();
  }

  let hostPath;
  let viewerPath;
  let expectedSessionId;
  let verify = false;
  let json = false;
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--verify") {
      if (verify) {
        throw new MvpEvidenceFixtureUsageError();
      }
      verify = true;
      continue;
    }
    if (arg === "--json") {
      if (json) {
        throw new MvpEvidenceFixtureUsageError();
      }
      json = true;
      continue;
    }
    if (arg === "--session") {
      const value = rawArgs[index + 1];
      if (value === undefined || value.startsWith("--") || expectedSessionId !== undefined) {
        throw new MvpEvidenceFixtureUsageError();
      }
      expectedSessionId = value;
      index += 1;
      continue;
    }
    if (arg === "--host" || arg === "--viewer") {
      const value = rawArgs[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new MvpEvidenceFixtureUsageError();
      }
      if (arg === "--host") {
        if (hostPath !== undefined) {
          throw new MvpEvidenceFixtureUsageError();
        }
        hostPath = value;
      } else {
        if (viewerPath !== undefined) {
          throw new MvpEvidenceFixtureUsageError();
        }
        viewerPath = value;
      }
      index += 1;
      continue;
    }
    throw new MvpEvidenceFixtureUsageError();
  }

  if (verify && expectedSessionId === undefined) {
    throw new MvpEvidenceFixtureUsageError();
  }

  const parsed = validateFixtureInputs(
    hostPath ?? DEFAULT_MVP_EVIDENCE_FIXTURE_HOST_PATH,
    viewerPath ?? DEFAULT_MVP_EVIDENCE_FIXTURE_VIEWER_PATH,
    expectedSessionId ?? DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID
  );

  return { help: false, ...parsed, verify, json };
}

export function runMvpEvidenceFixture(options = {}) {
  const hostPath = options.hostPath ?? DEFAULT_MVP_EVIDENCE_FIXTURE_HOST_PATH;
  const viewerPath = options.viewerPath ?? DEFAULT_MVP_EVIDENCE_FIXTURE_VIEWER_PATH;
  const writeText = options.writeText ?? writeFixtureText;
  const verify = options.verify === true;
  if (verify && options.expectedSessionId === undefined) {
    throw new MvpEvidenceFixtureUsageError();
  }
  const expectedSessionId = options.expectedSessionId ?? DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID;

  const paths = validateFixtureInputs(hostPath, viewerPath, expectedSessionId);
  const hostRecords = createHostFixtureRecords(paths.expectedSessionId);
  const viewerRecords = createViewerFixtureRecords(paths.expectedSessionId);
  try {
    writeText(paths.hostPath, jsonl(hostRecords));
    writeText(paths.viewerPath, jsonl(viewerRecords));
  } catch {
    throw new MvpEvidenceFixtureError("write-failed");
  }

  if (verify) {
    try {
      runMvpAuditSummaryCheck({
        hostPath: paths.hostPath,
        viewerPath: paths.viewerPath,
        expectedSessionId: paths.expectedSessionId,
        requireMvpEvidence: true
      });
    } catch {
      throw new MvpEvidenceFixtureError("verify-failed");
    }
  }

  return sanitizeEvidenceFixtureResult({
    ok: true,
    hostRecords: hostRecords.length,
    viewerRecords: viewerRecords.length,
    verified: verify
  });
}

export function formatMvpEvidenceFixtureResult(result) {
  const safeResult = sanitizeEvidenceFixtureResult(result);
  if (!safeResult) {
    return "WinBridge MVP evidence fixture failed. reason=verify-failed";
  }

  return [
    "WinBridge MVP evidence fixture generated.",
    `fixture.host=written records=${safeResult.hostRecords}`,
    `fixture.viewer=written records=${safeResult.viewerRecords}`,
    `verify=${safeResult.verified ? "passed" : "not-run"}`,
    "safety=generated-local-fixture-only"
  ].join("\n");
}

export function formatMvpEvidenceFixtureJsonResult(result) {
  const safeResult = sanitizeEvidenceFixtureResult(result);
  return JSON.stringify(
    safeResult ?? {
      ok: false,
      reason: "verify-failed"
    }
  );
}

export function formatMvpEvidenceFixtureError(error) {
  if (error instanceof MvpEvidenceFixtureUsageError) {
    return MVP_EVIDENCE_FIXTURE_USAGE;
  }
  return `WinBridge MVP evidence fixture failed. reason=${safeEvidenceFixtureReason(error?.reason ?? error?.message)}`;
}

export function formatMvpEvidenceFixtureJsonError(error) {
  return JSON.stringify({
    ok: false,
    reason: error instanceof MvpEvidenceFixtureUsageError
      ? "usage"
      : safeEvidenceFixtureReason(error?.reason ?? error?.message)
  });
}

function validateFixtureInputs(hostPath, viewerPath, expectedSessionId) {
  try {
    const parsed = parseMvpAuditSummaryArgs([
      "--host",
      hostPath,
      "--viewer",
      viewerPath,
      "--session",
      expectedSessionId
    ]);
    if (parsed.hostPath === parsed.viewerPath) {
      throw new Error("unsafe-path");
    }
    return {
      hostPath: parsed.hostPath,
      viewerPath: parsed.viewerPath,
      expectedSessionId: parsed.expectedSessionId
    };
  } catch {
    throw new MvpEvidenceFixtureUsageError();
  }
}

function writeFixtureText(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function createHostFixtureRecords(expectedSessionId) {
  return Object.freeze([
    auditRecord("fixture001", 1, "host", "agent-shell.authorization.approved", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      authorizationStatus: "approved",
      visibleToHost: false
    }),
    auditRecord("fixture002", 2, "host", "agent-shell.authorization.active", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      authorizationStatus: "active",
      visibleToHost: true
    }),
    auditRecord("fixture003", 3, "host", "agent-shell.remote-interaction.screen-capture.requested", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      authorizationStatus: "active",
      frameId: FIXTURE_FRAME_ID,
      sequence: 0,
      visibleToHost: true
    }),
    auditRecord("fixture004", 4, "host", "agent-shell.remote-interaction.screen-capture.completed", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      authorizationStatus: "active",
      frameId: FIXTURE_FRAME_ID,
      sequence: 0,
      visibleToHost: true
    }),
    auditRecord("fixture005", 5, "host", "agent-shell.remote-interaction.screen-frame.sent", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      frameId: FIXTURE_FRAME_ID,
      sequence: 0
    }),
    auditRecord("fixture006", 6, "host", "agent-shell.remote-interaction.input-event.application-requested", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      authorizationStatus: "active",
      eventId: FIXTURE_INPUT_EVENT_ID,
      sequence: 0
    }),
    auditRecord("fixture007", 7, "host", "agent-shell.remote-interaction.input-event.applied", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      authorizationStatus: "active",
      eventId: FIXTURE_INPUT_EVENT_ID,
      sequence: 0
    }),
    auditRecord("fixture008", 8, "host", "agent-shell.permission.revoked", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      authorizationStatus: "active"
    }),
    auditRecord("fixture009", 9, "host", "agent-shell.session.disconnected", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      authorizationStatus: "active"
    })
  ]);
}

function createViewerFixtureRecords(expectedSessionId) {
  return Object.freeze([
    auditRecord("fixture101", 1, "viewer", "agent-shell.remote-interaction.screen-frame.output-requested", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      frameId: FIXTURE_FRAME_ID,
      sequence: 0
    }),
    auditRecord("fixture102", 2, "viewer", "agent-shell.remote-interaction.screen-frame.output-written", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      frameId: FIXTURE_FRAME_ID,
      sequence: 0
    }),
    auditRecord("fixture103", 3, "viewer", "agent-shell.remote-interaction.input-event.sent", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      eventId: FIXTURE_INPUT_EVENT_ID,
      sequence: 0
    }),
    auditRecord("fixture104", 4, "viewer", "agent-shell.session.disconnected", expectedSessionId, {
      authorizationId: FIXTURE_AUTHORIZATION_ID,
      authorizationStatus: "active"
    })
  ]);
}

function auditRecord(eventId, offsetSeconds, actorType, action, expectedSessionId, detail) {
  return {
    eventId,
    timestamp: `2026-01-01T00:00:${String(offsetSeconds).padStart(2, "0")}.000Z`,
    actor: {
      type: actorType,
      id: `${actorType}fixture`
    },
    action,
    outcome: "accepted",
    sessionId: expectedSessionId,
    target: {
      type: "authorization",
      id: FIXTURE_AUTHORIZATION_ID
    },
    detail
  };
}

function jsonl(records) {
  return `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
}

function sanitizeEvidenceFixtureResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result) || result.ok !== true) {
    return undefined;
  }
  if (
    !Number.isInteger(result.hostRecords) ||
    result.hostRecords !== HOST_FIXTURE_RECORD_COUNT ||
    !Number.isInteger(result.viewerRecords) ||
    result.viewerRecords !== VIEWER_FIXTURE_RECORD_COUNT
  ) {
    return undefined;
  }
  return {
    ok: true,
    hostRecords: result.hostRecords,
    viewerRecords: result.viewerRecords,
    verified: result.verified === true
  };
}

function safeEvidenceFixtureReason(reason) {
  return FAILURE_REASONS.has(reason) ? reason : "verify-failed";
}

function runCli(rawArgs = process.argv.slice(2), streams = process) {
  try {
    const parsed = parseMvpEvidenceFixtureArgs(rawArgs);
    if (parsed.help) {
      streams.stdout.write(`${MVP_EVIDENCE_FIXTURE_USAGE}\n`);
      return 0;
    }
    const result = runMvpEvidenceFixture(parsed);
    streams.stdout.write(
      `${parsed.json ? formatMvpEvidenceFixtureJsonResult(result) : formatMvpEvidenceFixtureResult(result)}\n`
    );
    return 0;
  } catch (error) {
    const wantsJson = rawArgs.includes("--json");
    streams.stderr.write(
      `${wantsJson ? formatMvpEvidenceFixtureJsonError(error) : formatMvpEvidenceFixtureError(error)}\n`
    );
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runCli();
}
