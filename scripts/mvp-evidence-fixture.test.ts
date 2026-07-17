import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runMvpAuditSummaryCheck } from "./mvp-audit-summary.mjs";
import {
  DEFAULT_MVP_EVIDENCE_FIXTURE_HOST_PATH,
  DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID,
  DEFAULT_MVP_EVIDENCE_FIXTURE_VIEWER_PATH,
  formatMvpEvidenceFixtureError,
  formatMvpEvidenceFixtureJsonError,
  formatMvpEvidenceFixtureJsonResult,
  formatMvpEvidenceFixtureResult,
  MvpEvidenceFixtureUsageError,
  parseMvpEvidenceFixtureArgs,
  runMvpEvidenceFixture
} from "./mvp-evidence-fixture.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(scriptDirectory, "mvp-evidence-fixture.mjs");

describe("MVP evidence fixture helper", () => {
  it("parses defaults, explicit paths, verify, JSON, and help", () => {
    expect(parseMvpEvidenceFixtureArgs([])).toEqual({
      help: false,
      hostPath: DEFAULT_MVP_EVIDENCE_FIXTURE_HOST_PATH,
      viewerPath: DEFAULT_MVP_EVIDENCE_FIXTURE_VIEWER_PATH,
      expectedSessionId: DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID,
      verify: false,
      json: false
    });
    expect(
      parseMvpEvidenceFixtureArgs([
        "--json",
        "--verify",
        "--session",
        DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID,
        "--viewer",
        String.raw`logs\fixture-viewer.jsonl`,
        "--host",
        String.raw`logs\fixture-host.jsonl`
      ])
    ).toEqual({
      help: false,
      hostPath: String.raw`logs\fixture-host.jsonl`,
      viewerPath: String.raw`logs\fixture-viewer.jsonl`,
      expectedSessionId: DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID,
      verify: true,
      json: true
    });
    expect(parseMvpEvidenceFixtureArgs(["--help"])).toEqual({ help: true });
  });

  it("writes fixtures that pass the real strict audit summary gate", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "winbridge-evidence-fixture-"));
    try {
      const hostPath = join(tempDir, "host-audit.jsonl");
      const viewerPath = join(tempDir, "viewer-audit.jsonl");
      const result = runMvpEvidenceFixture({
        hostPath,
        viewerPath,
        expectedSessionId: DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID,
        verify: true
      });
      const text = formatMvpEvidenceFixtureResult(result);
      const json = JSON.parse(formatMvpEvidenceFixtureJsonResult(result));

      expect(existsSync(hostPath)).toBe(true);
      expect(existsSync(viewerPath)).toBe(true);
      expect(result).toEqual({
        ok: true,
        hostRecords: 9,
        viewerRecords: 4,
        verified: true
      });
      expect(text).toBe(
        [
          "WinBridge MVP evidence fixture generated.",
          "fixture.host=written records=9",
          "fixture.viewer=written records=4",
          "verify=passed",
          "safety=generated-local-fixture-only"
        ].join("\n")
      );
      expect(json).toEqual(result);
      expect(() =>
        runMvpAuditSummaryCheck({
          hostPath,
          viewerPath,
          expectedSessionId: DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID,
          requireMvpEvidence: true
        })
      ).not.toThrow();
      assertNoUnsafeOutput(text);
      assertNoUnsafeOutput(JSON.stringify(json));
      expect(text).not.toContain(tempDir);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("formats non-verified generation without raw paths or audit records", () => {
    const writes = new Map<string, string>();
    const result = runMvpEvidenceFixture({
      hostPath: String.raw`logs\fixture-host.jsonl`,
      viewerPath: String.raw`logs\fixture-viewer.jsonl`,
      writeText: (path: string, content: string) => writes.set(path, content)
    });
    const text = formatMvpEvidenceFixtureResult(result);

    expect(writes.size).toBe(2);
    const hostLines = writes.get(String.raw`logs\fixture-host.jsonl`)?.split(/\r?\n/).filter(Boolean) ?? [];
    const viewerLines = writes.get(String.raw`logs\fixture-viewer.jsonl`)?.split(/\r?\n/).filter(Boolean) ?? [];
    expect(hostLines).toHaveLength(9);
    expect(viewerLines).toHaveLength(4);
    const records = [...hostLines, ...viewerLines].map((line) => JSON.parse(line));
    expect(new Set(records.map((record) => record.sessionId))).toEqual(
      new Set([DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID])
    );
    expect(new Set(records.map((record) => record.detail.authorizationId))).toEqual(
      new Set(["fixtureauth"])
    );
    expect(hostLines.map((line) => JSON.parse(line).action)).toEqual([
      "agent-shell.authorization.approved",
      "agent-shell.authorization.active",
      "agent-shell.remote-interaction.screen-capture.requested",
      "agent-shell.remote-interaction.screen-capture.completed",
      "agent-shell.remote-interaction.screen-frame.sent",
      "agent-shell.remote-interaction.input-event.application-requested",
      "agent-shell.remote-interaction.input-event.applied",
      "agent-shell.permission.revoked",
      "agent-shell.session.disconnected"
    ]);
    expect(viewerLines.map((line) => JSON.parse(line).action)).toEqual([
      "agent-shell.remote-interaction.screen-frame.output-requested",
      "agent-shell.remote-interaction.screen-frame.output-written",
      "agent-shell.remote-interaction.input-event.sent",
      "agent-shell.session.disconnected"
    ]);
    expect(text).toContain("verify=not-run");
    assertNoUnsafeOutput(text);
  });

  it("rejects unsafe or ambiguous arguments without echoing raw values", () => {
    for (const args of [
      ["--host"],
      ["--viewer"],
      ["--host", String.raw`logs\fixture-host.jsonl`, "--host", "raw-secret-token"],
      ["--viewer", String.raw`logs\fixture-viewer.jsonl`, "--viewer", "raw-secret-token"],
      ["--verify", "--verify"],
      ["--verify"],
      ["--session"],
      ["--session", DEFAULT_MVP_EVIDENCE_FIXTURE_SESSION_ID, "--session", "raw-secret-token"],
      ["--session", " raw-secret-token "],
      ["--json", "--json"],
      ["--host", " raw-secret-token ", "--viewer", String.raw`logs\fixture-viewer.jsonl`],
      ["--host", String.raw`logs\NUL.jsonl`, "--viewer", String.raw`logs\fixture-viewer.jsonl`],
      [
        "--host",
        String.raw`logs\fixture-host.jsonl:hidden`,
        "--viewer",
        String.raw`logs\fixture-viewer.jsonl`
      ],
      [
        "--host",
        String.raw`logs\same.jsonl`,
        "--viewer",
        String.raw`logs\same.jsonl`
      ],
      ["--token", "raw-secret-token"]
    ]) {
      let thrown: unknown;
      try {
        parseMvpEvidenceFixtureArgs(args);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(MvpEvidenceFixtureUsageError);
      expect(formatMvpEvidenceFixtureError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpEvidenceFixtureJsonError(thrown)).toBe('{"ok":false,"reason":"usage"}');
    }
  });

  it("fails closed on write or verify errors without paths or raw records", () => {
    const secretPath = String.raw`C:\Users\Nur\secret-fixture\host-audit.jsonl`;
    expect(() =>
      runMvpEvidenceFixture({
        hostPath: secretPath,
        viewerPath: String.raw`logs\fixture-viewer.jsonl`,
        writeText: () => {
          throw new Error("raw-secret-token write failed");
        }
      })
    ).toThrow("write-failed");

    const text = formatMvpEvidenceFixtureError(new Error(`raw-secret-token ${secretPath}`));
    const json = formatMvpEvidenceFixtureJsonError(new Error(`raw-secret-token ${secretPath}`));
    expect(text).toBe("WinBridge MVP evidence fixture failed. reason=verify-failed");
    expect(json).toBe('{"ok":false,"reason":"verify-failed"}');
    expect(text).not.toContain("raw-secret-token");
    expect(text).not.toContain(secretPath);
    expect(json).not.toContain("raw-secret-token");
    expect(json).not.toContain(secretPath);
  });

  it("does not import child process, socket, HTTP, native adapter, or browser APIs", () => {
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

function assertNoUnsafeOutput(output: string) {
  for (const unsafe of [
    "fixture001",
    "fixture101",
    "hostfixture",
    "viewerfixture",
    "fixture-session",
    "fixtureauth",
    "fixture-host.jsonl",
    "fixture-viewer.jsonl",
    "host-audit.jsonl",
    "viewer-audit.jsonl",
    '"action"',
    '"actor"',
    '"target"',
    "raw-secret-token",
    "pointer",
    '"detail"'
  ]) {
    expect(output).not.toContain(unsafe);
  }
}
