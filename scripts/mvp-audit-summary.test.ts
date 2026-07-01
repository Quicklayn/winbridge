import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  formatMvpAuditSummaryError,
  formatMvpAuditSummaryJsonError,
  formatMvpAuditSummaryJsonResult,
  formatMvpAuditSummaryResult,
  MvpAuditSummaryError,
  MvpAuditSummaryUsageError,
  parseMvpAuditSummaryArgs,
  runMvpAuditSummaryCheck,
  summarizeAuditSummaryContent
} from "./mvp-audit-summary.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(scriptDirectory, "mvp-audit-summary.mjs");

describe("MVP audit summary", () => {
  it("parses explicit host and viewer paths with optional JSON mode", () => {
    expect(
      parseMvpAuditSummaryArgs([
        "--host",
        String.raw`logs\host-audit.jsonl`,
        "--viewer",
        String.raw`logs\viewer-audit.jsonl`
      ])
    ).toEqual({
      help: false,
      hostPath: String.raw`logs\host-audit.jsonl`,
      viewerPath: String.raw`logs\viewer-audit.jsonl`,
      json: false,
      requireMvpEvidence: false
    });
    expect(
      parseMvpAuditSummaryArgs([
        "--json",
        "--require-mvp-evidence",
        "--viewer",
        String.raw`logs\viewer-audit.jsonl`,
        "--host",
        String.raw`logs\host-audit.jsonl`
      ])
    ).toMatchObject({ json: true, requireMvpEvidence: true });
    expect(parseMvpAuditSummaryArgs(["--help"])).toEqual({ help: true });
  });

  it("rejects unsafe or ambiguous arguments without echoing raw values", () => {
    for (const args of [
      [],
      ["--host", String.raw`logs\host-audit.jsonl`],
      ["--host", String.raw`logs\host-audit.jsonl`, "--host", "raw-secret-token"],
      ["--host", " raw-secret-token ", "--viewer", String.raw`logs\viewer-audit.jsonl`],
      ["--host", String.raw`logs\NUL.jsonl`, "--viewer", String.raw`logs\viewer-audit.jsonl`],
      [
        "--host",
        String.raw`logs\host-audit.jsonl:hidden`,
        "--viewer",
        String.raw`logs\viewer-audit.jsonl`
      ],
      [
        "--host",
        String.raw`\\?\C:\logs\host-audit.jsonl`,
        "--viewer",
        String.raw`logs\viewer-audit.jsonl`
      ],
      [
        "--host",
        String.raw`logs\host-audit.jsonl`,
        "--viewer",
        String.raw`logs\viewer-audit.jsonl`,
        "--require-mvp-evidence",
        "--require-mvp-evidence"
      ]
    ]) {
      let thrown: unknown;
      try {
        parseMvpAuditSummaryArgs(args);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(MvpAuditSummaryUsageError);
      expect(formatMvpAuditSummaryError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpAuditSummaryJsonError(thrown)).toBe('{"ok":false,"reason":"usage"}');
    }
  });

  it("summarizes text and JSON evidence without raw identifiers or details", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "winbridge-audit-summary-"));
    try {
      const hostPath = join(tempDir, "host-audit.jsonl");
      const viewerPath = join(tempDir, "viewer-audit.jsonl");
      writeFileSync(
        hostPath,
        jsonl([
          auditRecord("agent-shell.authorization.approved", "accepted", "host"),
          auditRecord("agent-shell.authorization.active", "accepted", "host"),
          auditRecord("agent-shell.remote-interaction.screen-frame.sent", "accepted", "host"),
          auditRecord("agent-shell.permission.revoked", "accepted", "host"),
          auditRecord("agent-shell.session.disconnected", "accepted", "host")
        ])
      );
      writeFileSync(
        viewerPath,
        jsonl([
          auditRecord("agent-shell.remote-interaction.screen-frame.output-written", "accepted", "viewer"),
          auditRecord("agent-shell.remote-interaction.input-event.sent", "accepted", "viewer"),
          auditRecord("agent-shell.viewer.disconnect.sent", "accepted", "viewer"),
          auditRecord("agent-shell.remote-interaction.input-event.sent", "denied", "viewer")
        ])
      );

      const result = runMvpAuditSummaryCheck({ hostPath, viewerPath, requireMvpEvidence: true });
      const text = formatMvpAuditSummaryResult(result);
      const parsed = JSON.parse(formatMvpAuditSummaryJsonResult(result));

      expect(text).toBe(
        [
          "WinBridge MVP audit summary passed.",
          "audit.host.records=5 accepted=5 denied=0 failed=0",
          "audit.viewer.records=4 accepted=3 denied=1 failed=0",
          "audit.coverage=authorizationApproved,authorizationActive,screenFrameSent,screenFrameOutput,inputSent,permissionRevoked,disconnectObserved",
          "safety=bounded-metadata-only"
        ].join("\n")
      );
      expect(parsed).toEqual({
        ok: true,
        roles: {
          host: {
            records: 5,
            accepted: 5,
            denied: 0,
            failed: 0,
            authorizationApproved: true,
            authorizationActive: true,
            screenFrameSent: true,
            screenFrameOutput: false,
            inputSent: false,
            permissionRevoked: true,
            disconnectObserved: true
          },
          viewer: {
            records: 4,
            accepted: 3,
            denied: 1,
            failed: 0,
            authorizationApproved: false,
            authorizationActive: false,
            screenFrameSent: false,
            screenFrameOutput: true,
            inputSent: true,
            permissionRevoked: false,
            disconnectObserved: true
          }
        },
        coverage: [
          "authorizationApproved",
          "authorizationActive",
          "screenFrameSent",
          "screenFrameOutput",
          "inputSent",
          "permissionRevoked",
          "disconnectObserved"
        ]
      });
      assertNoUnsafeOutput(text);
      assertNoUnsafeOutput(JSON.stringify(parsed));
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("fails strict MVP evidence mode without exposing raw audit data", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "winbridge-audit-summary-"));
    try {
      const hostPath = join(tempDir, "host-audit.jsonl");
      const viewerPath = join(tempDir, "viewer-audit.jsonl");
      writeFileSync(
        hostPath,
        jsonl([
          auditRecord("agent-shell.authorization.approved", "accepted", "host"),
          auditRecord("agent-shell.authorization.active", "accepted", "host")
        ])
      );
      writeFileSync(
        viewerPath,
        jsonl([auditRecord("agent-shell.remote-interaction.screen-frame.output-written", "accepted", "viewer")])
      );

      const partial = runMvpAuditSummaryCheck({ hostPath, viewerPath });
      expect(partial.coverage).toEqual([
        "authorizationApproved",
        "authorizationActive",
        "screenFrameOutput"
      ]);

      let thrown: unknown;
      try {
        runMvpAuditSummaryCheck({ hostPath, viewerPath, requireMvpEvidence: true });
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(MvpAuditSummaryError);
      const text = formatMvpAuditSummaryError(thrown);
      const json = formatMvpAuditSummaryJsonError(thrown);
      expect(text).toBe("WinBridge MVP audit summary failed. reason=missing-required-evidence");
      expect(json).toBe('{"ok":false,"reason":"missing-required-evidence"}');
      assertNoUnsafeOutput(text);
      assertNoUnsafeOutput(json);
      expect(text).not.toContain(tempDir);
      expect(json).not.toContain(tempDir);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("does not count denied or failed audit outcomes as required MVP evidence", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "winbridge-audit-summary-"));
    try {
      const hostPath = join(tempDir, "host-audit.jsonl");
      const viewerPath = join(tempDir, "viewer-audit.jsonl");
      writeFileSync(
        hostPath,
        jsonl([
          auditRecord("agent-shell.authorization.approved", "denied", "host"),
          auditRecord("agent-shell.authorization.active", "failed", "host"),
          auditRecord("agent-shell.remote-interaction.screen-frame.sent", "failed", "host"),
          auditRecord("agent-shell.permission.revoked", "denied", "host"),
          auditRecord("agent-shell.lifecycle.disconnected", "failed", "host")
        ])
      );
      writeFileSync(
        viewerPath,
        jsonl([
          auditRecord("agent-shell.remote-interaction.screen-frame.output-written", "failed", "viewer"),
          auditRecord("agent-shell.remote-interaction.input-event.sent", "denied", "viewer"),
          auditRecord("agent-shell.viewer.disconnect.sent", "failed", "viewer")
        ])
      );

      const partial = runMvpAuditSummaryCheck({ hostPath, viewerPath });
      expect(partial.coverage).toEqual([]);
      expect(() =>
        runMvpAuditSummaryCheck({ hostPath, viewerPath, requireMvpEvidence: true })
      ).toThrow(MvpAuditSummaryError);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("does not count accepted wrong-role evidence as required MVP evidence", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "winbridge-audit-summary-"));
    try {
      const hostPath = join(tempDir, "host-audit.jsonl");
      const viewerPath = join(tempDir, "viewer-audit.jsonl");
      writeFileSync(
        hostPath,
        jsonl([
          auditRecord("agent-shell.remote-interaction.screen-frame.output-written", "accepted", "host"),
          auditRecord("agent-shell.remote-interaction.input-event.sent", "accepted", "host"),
          auditRecord("agent-shell.host.disconnect.sent", "accepted", "host")
        ])
      );
      writeFileSync(
        viewerPath,
        jsonl([
          auditRecord("agent-shell.authorization.approved", "accepted", "viewer"),
          auditRecord("agent-shell.authorization.active", "accepted", "viewer"),
          auditRecord("agent-shell.remote-interaction.screen-frame.sent", "accepted", "viewer"),
          auditRecord("agent-shell.permission.revoked", "accepted", "viewer"),
          auditRecord("agent-shell.viewer.disconnect.sent", "accepted", "viewer")
        ])
      );

      const partial = runMvpAuditSummaryCheck({ hostPath, viewerPath });
      expect(partial.coverage).toEqual([
        "authorizationApproved",
        "authorizationActive",
        "screenFrameSent",
        "screenFrameOutput",
        "inputSent",
        "permissionRevoked",
        "disconnectObserved"
      ]);

      let thrown: unknown;
      try {
        runMvpAuditSummaryCheck({ hostPath, viewerPath, requireMvpEvidence: true });
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(MvpAuditSummaryError);
      expect(formatMvpAuditSummaryError(thrown)).toBe(
        "WinBridge MVP audit summary failed. reason=missing-required-evidence"
      );
      expect(formatMvpAuditSummaryJsonError(thrown)).toBe(
        '{"ok":false,"reason":"missing-required-evidence"}'
      );
      assertNoUnsafeOutput(formatMvpAuditSummaryError(thrown));
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("does not count swapped disconnect actions as role-bound MVP evidence", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "winbridge-audit-summary-"));
    try {
      const hostPath = join(tempDir, "host-audit.jsonl");
      const viewerPath = join(tempDir, "viewer-audit.jsonl");
      writeFileSync(
        hostPath,
        jsonl([
          auditRecord("agent-shell.authorization.approved", "accepted", "host"),
          auditRecord("agent-shell.authorization.active", "accepted", "host"),
          auditRecord("agent-shell.remote-interaction.screen-frame.sent", "accepted", "host"),
          auditRecord("agent-shell.permission.revoked", "accepted", "host"),
          auditRecord("agent-shell.viewer.disconnect.sent", "accepted", "host")
        ])
      );
      writeFileSync(
        viewerPath,
        jsonl([
          auditRecord("agent-shell.remote-interaction.screen-frame.output-written", "accepted", "viewer"),
          auditRecord("agent-shell.remote-interaction.input-event.sent", "accepted", "viewer"),
          auditRecord("agent-shell.host.disconnect.sent", "accepted", "viewer")
        ])
      );

      const partial = runMvpAuditSummaryCheck({ hostPath, viewerPath });
      expect(partial.coverage).toEqual([
        "authorizationApproved",
        "authorizationActive",
        "screenFrameSent",
        "screenFrameOutput",
        "inputSent",
        "permissionRevoked",
        "disconnectObserved"
      ]);
      expect(() =>
        runMvpAuditSummaryCheck({ hostPath, viewerPath, requireMvpEvidence: true })
      ).toThrow(MvpAuditSummaryError);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("fails closed on malformed files, unsafe records, and oversized input", () => {
    expect(() => summarizeAuditSummaryContent("host", "")).toThrow(MvpAuditSummaryError);
    expect(() => summarizeAuditSummaryContent("host", "{not-json}\n")).toThrow(
      MvpAuditSummaryError
    );
    expect(() => summarizeAuditSummaryContent("host", "[]\n")).toThrow(MvpAuditSummaryError);
    expect(() =>
      summarizeAuditSummaryContent(
        "host",
        `${JSON.stringify({ ...auditRecord("agent-shell.authorization.approved"), extra: true })}\n`
      )
    ).toThrow(MvpAuditSummaryError);
    expect(() =>
      summarizeAuditSummaryContent(
        "host",
        `${JSON.stringify(auditRecord("agent-shell.token.raw-secret"))}\n`
      )
    ).toThrow(MvpAuditSummaryError);
    expect(() =>
      summarizeAuditSummaryContent("host", `${"a".repeat(4097)}\n`)
    ).toThrow(MvpAuditSummaryError);
    expect(() =>
      runMvpAuditSummaryCheck({
        hostPath: String.raw`logs\host-audit.jsonl`,
        viewerPath: String.raw`logs\viewer-audit.jsonl`,
        stat: () => ({ size: 512 * 1024 + 1 }),
        readText: () => {
          throw new Error("should-not-read");
        }
      })
    ).toThrow(MvpAuditSummaryError);
  });

  it("formats fixed failure reasons without paths, raw records, or secrets", () => {
    const secretPath = String.raw`C:\Users\Nur\secret-audit\host-audit.jsonl`;
    const errors = [
      new MvpAuditSummaryError("unsafe-path"),
      new MvpAuditSummaryError("malformed-jsonl"),
      new Error(`raw-secret-token at ${secretPath}`)
    ];

    for (const error of errors) {
      const text = formatMvpAuditSummaryError(error);
      const json = formatMvpAuditSummaryJsonError(error);

      expect(text).toMatch(/^WinBridge MVP audit summary failed\. reason=/);
      expect(json).toMatch(/^\{"ok":false,"reason":"[a-z-]+"\}$/);
      expect(text).not.toContain(secretPath);
      expect(text).not.toContain("raw-secret-token");
      expect(json).not.toContain(secretPath);
      expect(json).not.toContain("raw-secret-token");
    }
  });

  it("does not import process, socket, HTTP, native adapter, or browser APIs", () => {
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
    expect(source).not.toContain("Playwright");
    expect(source).not.toContain('from "@winbridge/windows-capture"');
    expect(source).not.toContain('from "@winbridge/windows-input"');
    expect(source).not.toContain('import("@winbridge/windows-capture")');
    expect(source).not.toContain('import("@winbridge/windows-input")');
  });
});

function auditRecord(action: string, outcome = "accepted", actorType = "host") {
  return {
    eventId: "audit0001",
    timestamp: "2026-01-01T00:00:00.000Z",
    actor: {
      type: actorType,
      id: `${actorType}001`
    },
    action,
    outcome,
    sessionId: "session001",
    target: {
      type: "authorization",
      id: "auth0001"
    },
    detail: {
      authorizationId: "auth0001",
      displayName: "Raw Secret Display Name",
      pointer: { x: 0.5, y: 0.5 },
      token: "raw-secret-token"
    }
  };
}

function jsonl(records: unknown[]) {
  return `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
}

function assertNoUnsafeOutput(output: string) {
  for (const unsafe of [
    "audit0001",
    "host001",
    "viewer001",
    "session001",
    "auth0001",
    "Raw Secret Display Name",
    "raw-secret-token",
    "host-audit.jsonl",
    "viewer-audit.jsonl",
    "pointer",
    '"detail"'
  ]) {
    expect(output).not.toContain(unsafe);
  }
}
