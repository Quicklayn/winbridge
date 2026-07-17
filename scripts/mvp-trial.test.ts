import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  createMvpTrialPlan,
  formatMvpTrialError,
  formatMvpTrialEvidenceJsonResult,
  formatMvpTrialEvidenceResult,
  formatMvpTrialPlan,
  formatMvpTrialPlanJson,
  MvpTrialUsageError,
  parseMvpTrialArgs,
  runMvpTrialEvidence
} from "./mvp-trial.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(scriptDirectory, "mvp-trial.mjs");
const RELAY_HOST_PLACEHOLDER_FOR_TESTS = "<relay-pc-lan-ip>";

describe("MVP two-PC trial helper", () => {
  it("parses plan, JSON, role, help, and evidence modes", () => {
    expect(parseMvpTrialArgs([])).toEqual({
      help: false,
      mode: "plan",
      json: false,
      role: undefined
    });
    expect(parseMvpTrialArgs(["--json"])).toMatchObject({
      help: false,
      mode: "plan",
      json: true
    });
    expect(parseMvpTrialArgs(["--role", "host"])).toMatchObject({
      help: false,
      mode: "plan",
      role: "host"
    });
    expect(parseMvpTrialArgs(["--role", "browser"])).toMatchObject({
      help: false,
      mode: "plan",
      role: "browser"
    });
    expect(parseMvpTrialArgs(["--relay-host", "192.168.1.10"])).toMatchObject({
      help: false,
      mode: "plan",
      relayHost: "192.168.1.10"
    });
    expect(parseMvpTrialArgs(["--role", "viewer", "--relay-host", "support-relay.lan"])).toMatchObject({
      help: false,
      mode: "plan",
      role: "viewer",
      relayHost: "support-relay.lan"
    });
    expect(parseMvpTrialArgs(["--help"])).toEqual({ help: true });
    expect(
      parseMvpTrialArgs([
        "--evidence",
        "--host-audit",
        String.raw`logs\host-audit.jsonl`,
        "--viewer-audit",
        String.raw`logs\viewer-audit.jsonl`,
        "--session",
        "session001"
      ])
    ).toMatchObject({
      help: false,
      mode: "evidence",
      json: false,
      hostPath: String.raw`logs\host-audit.jsonl`,
      viewerPath: String.raw`logs\viewer-audit.jsonl`,
      expectedSessionId: "session001"
    });
  });

  it("prints a bounded non-executing workflow for every role", () => {
    const output = formatMvpTrialPlan(createMvpTrialPlan());

    expect(output).toContain("WinBridge two-PC MVP trial workflow.");
    expect(output).toContain("mode=plan nonExecuting=true");
    expect(output).toContain("[preflight] Preflight dry run");
    expect(output).toContain(
      "npm run mvp:commands -- --generate-session --generate-pairing --relay-host <relay-pc-lan-ip> --token-env WINBRIDGE_RELAY_SHARED_TOKEN"
    );
    expect(output).toContain("npm run mvp:ready -- --include-all-smoke");
    expect(output).toContain("npm run mvp:ready -- --include-windows-control-smoke");
    expect(output).toContain("npm run mvp:ready -- --include-evidence-fixture");
    expect(output).toContain("live trial proof still requires post-run role-bound evidence");
    expect(output).toContain("[relay] Relay PC");
    expect(output).toContain("npm run mvp:ready -- --role relay");
    expect(output).toContain("npm run mvp:commands -- --only relay");
    expect(output).toContain(
      "npm run mvp:run -- --role relay --session <session-id> --pairing <pairing-code> --relay-host <relay-pc-lan-ip> --token-env WINBRIDGE_RELAY_SHARED_TOKEN --i-understand-foreground"
    );
    expect(output).toContain("[host] Host PC");
    expect(output).toContain("npm run mvp:ready -- --role host");
    expect(output).toContain("npm run mvp:lan-probe -- --role host");
    expect(output).toContain(
      "npm run mvp:run -- --role host --session <session-id> --pairing <pairing-code> --relay-host <relay-pc-lan-ip> --token-env WINBRIDGE_RELAY_SHARED_TOKEN --i-understand-foreground"
    );
    expect(output).toContain("approve only the visible host consent prompt");
    expect(output).toContain("[viewer] Viewer PC");
    expect(output).toContain("npm run mvp:ready -- --role viewer");
    expect(output).toContain("npm run mvp:commands -- --only browser");
    expect(output).toContain("npm run mvp:lan-probe -- --role viewer");
    expect(output).toContain(
      "npm run mvp:run -- --role viewer --session <session-id> --pairing <pairing-code> --relay-host <relay-pc-lan-ip> --token-env WINBRIDGE_RELAY_SHARED_TOKEN --i-understand-foreground"
    );
    expect(output).toContain("[browser] Viewer browser");
    expect(output).toContain("Open the loopback viewer surface only after the viewer command reports readiness");
    expect(output).toContain("[evidence] Post-run evidence");
    expect(output).toContain("npm run mvp:audit-summary");
    expect(output).toContain("--session <session-id> --require-mvp-evidence");
    expect(output).toContain("--require-mvp-evidence");
    assertNoUnsafeOutput(output);
  });

  it("prints bounded JSON plan metadata with the fixed bootstrap reference", () => {
    const output = formatMvpTrialPlanJson(createMvpTrialPlan());
    const parsed = JSON.parse(output);

    expect(parsed).toEqual({
      ok: true,
      mode: "plan",
      nonExecuting: true,
      roles: expect.arrayContaining([
        expect.objectContaining({ role: "relay", title: "Relay PC" }),
        expect.objectContaining({ role: "host", title: "Host PC" }),
        expect.objectContaining({ role: "viewer", title: "Viewer PC" }),
        expect.objectContaining({ role: "browser", title: "Viewer browser" }),
        expect.objectContaining({ role: "preflight", title: "Preflight dry run" }),
        expect.objectContaining({ role: "evidence", title: "Post-run evidence" })
      ]),
      safety: [
        "host-consent-required",
        "host-visible-session-required",
        "host-can-pause-revoke-disconnect",
        "strict-audit-evidence-required",
        "plan-is-non-executing"
      ]
    });
    expect(JSON.stringify(parsed)).toContain(
      "npm run mvp:commands -- --generate-session --generate-pairing --relay-host <relay-pc-lan-ip> --token-env WINBRIDGE_RELAY_SHARED_TOKEN"
    );
    expect(parsed.roles.find((section: { role: string }) => section.role === "preflight").steps).toEqual([
      expect.objectContaining({ name: "session-bootstrap" }),
      { name: "all-smoke", command: "npm run mvp:ready -- --include-all-smoke" },
      {
        name: "windows-control-smoke",
        command: "npm run mvp:ready -- --include-windows-control-smoke"
      },
      { name: "evidence-fixture", command: "npm run mvp:ready -- --include-evidence-fixture" },
      expect.objectContaining({ name: "operator-check" })
    ]);
    expect(output).toContain("<relay-pc-lan-ip>");
    expect(output).toContain("<host-audit-jsonl>");
    assertNoUnsafeOutput(output);
  });

  it("prints bounded relay-host command references without generated runtime commands", () => {
    const output = formatMvpTrialPlan(createMvpTrialPlan({ relayHost: "192.168.1.10" }));

    expect(output).toContain("npm run mvp:commands -- --only relay --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(output).toContain("npm run mvp:commands -- --generate-session --generate-pairing --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(output).toContain("npm run mvp:commands -- --only host --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(output).toContain("npm run mvp:commands -- --only viewer --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(output).toContain("npm run mvp:commands -- --only browser --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(output).toContain("npm run mvp:lan-probe -- --role host --relay-host 192.168.1.10 --session <session-id> --pairing <pairing-code> --peer host-probe --device host-device --token-env WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(output).toContain("npm run mvp:lan-probe -- --role viewer --relay-host 192.168.1.10 --session <session-id> --pairing <pairing-code> --peer viewer-probe --device viewer-device --token-env WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(output).toContain("npm run mvp:run -- --role relay --session <session-id> --pairing <pairing-code> --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN --i-understand-foreground");
    expect(output).toContain("npm run mvp:run -- --role host --session <session-id> --pairing <pairing-code> --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN --i-understand-foreground");
    expect(output).toContain("npm run mvp:run -- --role viewer --session <session-id> --pairing <pairing-code> --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN --i-understand-foreground");
    expect(output).not.toContain(RELAY_HOST_PLACEHOLDER_FOR_TESTS);
    expect(output).not.toContain("npm run dev:agent -- host");
    expect(output).not.toContain("npm run dev:agent -- viewer");
    assertNoUnsafeOutput(output);
  });

  it("prints role-filtered browser plan metadata", () => {
    const output = formatMvpTrialPlanJson(
      createMvpTrialPlan({ role: "browser", relayHost: "support-relay.lan" })
    );
    const parsed = JSON.parse(output);

    expect(parsed.roles).toHaveLength(1);
    expect(parsed.roles[0].role).toBe("browser");
    expect(parsed.roles[0].title).toBe("Viewer browser");
    expect(JSON.stringify(parsed)).toContain("npm run mvp:ready -- --role viewer");
    expect(JSON.stringify(parsed)).toContain("npm run mvp:commands -- --only browser --relay-host support-relay.lan --token-env WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(JSON.stringify(parsed)).not.toContain("npm run mvp:run");
    expect(JSON.stringify(parsed)).not.toContain("npm run mvp:lan-probe");
    expect(JSON.stringify(parsed)).not.toContain("[relay]");
    expect(JSON.stringify(parsed)).not.toContain("npm run dev:agent");
    assertNoUnsafeOutput(output);
  });

  it("prints role-filtered relay-host JSON plan metadata", () => {
    const output = formatMvpTrialPlanJson(
      createMvpTrialPlan({ role: "viewer", relayHost: "support-relay.lan" })
    );
    const parsed = JSON.parse(output);

    expect(parsed.roles).toHaveLength(1);
    expect(parsed.roles[0].role).toBe("viewer");
    expect(JSON.stringify(parsed)).toContain("--relay-host support-relay.lan");
    expect(JSON.stringify(parsed)).not.toContain("[relay]");
    expect(JSON.stringify(parsed)).not.toContain("npm run dev:agent");
    assertNoUnsafeOutput(output);
  });

  it("filters a single role in plan mode", () => {
    const host = formatMvpTrialPlan(createMvpTrialPlan({ role: "host" }));

    expect(host).toContain("[host] Host PC");
    expect(host).toContain("npm run mvp:ready -- --role host");
    expect(host).not.toContain("[preflight] Preflight dry run");
    expect(host).not.toContain("--generate-session");
    expect(host).not.toContain("--generate-pairing");
    expect(host).not.toContain("npm run mvp:ready -- --include-all-smoke");
    expect(host).not.toContain("npm run mvp:ready -- --include-windows-control-smoke");
    expect(host).not.toContain("npm run mvp:ready -- --include-evidence-fixture");
    expect(host).not.toContain("[relay] Relay PC");
    expect(host).not.toContain("[viewer] Viewer PC");
    expect(host).not.toContain("[browser] Viewer browser");
    expect(host).not.toContain("[evidence] Post-run evidence");

    const browser = formatMvpTrialPlan(createMvpTrialPlan({ role: "browser" }));
    expect(browser).toContain("[browser] Viewer browser");
    expect(browser).toContain("npm run mvp:ready -- --role viewer");
    expect(browser).toContain("npm run mvp:commands -- --only browser");
    expect(browser).toContain("Open the loopback viewer surface only after the viewer command reports readiness");
    expect(browser).not.toContain("[preflight] Preflight dry run");
    expect(browser).not.toContain("[relay] Relay PC");
    expect(browser).not.toContain("[host] Host PC");
    expect(browser).not.toContain("[viewer] Viewer PC");
    expect(browser).not.toContain("[evidence] Post-run evidence");
    expect(browser).not.toContain("npm run mvp:run");
    expect(browser).not.toContain("npm run mvp:lan-probe");
    assertNoUnsafeOutput(browser);
  });

  it("rejects malformed options without echoing raw values", () => {
    for (const args of [
      ["--json", "--json"],
      ["--role"],
      ["--role", "preflight"],
      ["--role", "raw-secret-token"],
      ["--role", "host", "--role", "viewer"],
      ["--relay-host"],
      ["--relay-host", "localhost"],
      ["--relay-host", "127.0.0.1"],
      ["--relay-host", "0.0.0.0"],
      ["--relay-host", "999.1.1.1"],
      ["--relay-host", "raw-secret-token"],
      ["--relay-host", "192.168.1.10", "--relay-host", "192.168.1.11"],
      ["--evidence", "--relay-host", "192.168.1.10", "--host-audit", String.raw`logs\host-audit.jsonl`, "--viewer-audit", String.raw`logs\viewer-audit.jsonl`],
      ["--evidence", "--role", "browser"],
      ["--evidence", "--role", "evidence"],
      ["--evidence"],
      ["--evidence", "--host-audit", String.raw`logs\host-audit.jsonl`, "--viewer-audit", String.raw`logs\viewer-audit.jsonl`],
      ["--evidence", "--host-audit", String.raw`logs\host-audit.jsonl`, "--viewer-audit", String.raw`logs\viewer-audit.jsonl`, "--session", " raw-secret-token "],
      ["--evidence", "--host-audit", String.raw`logs\host-audit.jsonl`, "--viewer-audit", String.raw`logs\viewer-audit.jsonl`, "--session", "session001", "--session", "raw-secret-token"],
      ["--session", "session001"],
      ["--host-audit", String.raw`logs\host-audit.jsonl`],
      ["--evidence", "--host-audit", " raw-secret-token ", "--viewer-audit", String.raw`logs\viewer-audit.jsonl`],
      [
        "--evidence",
        "--host-audit",
        String.raw`logs\host-audit.jsonl:hidden`,
        "--viewer-audit",
        String.raw`logs\viewer-audit.jsonl`
      ],
      [
        "--evidence",
        "--host-audit",
        String.raw`logs\NUL.jsonl`,
        "--viewer-audit",
        String.raw`logs\viewer-audit.jsonl`
      ]
    ]) {
      let thrown: unknown;
      try {
        parseMvpTrialArgs(args);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeTruthy();
      expect(formatMvpTrialError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpTrialError(thrown)).not.toContain("192.168.1.10");
      expect(formatMvpTrialError(thrown)).not.toContain("host-audit.jsonl:hidden");
      expect(formatMvpTrialError(thrown, { json: true })).toMatch(/^\{"ok":false,"reason":"[a-z-]+"\}$/);
    }
  });

  it("passes strict evidence mode with bounded text and JSON output", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "winbridge-trial-"));
    try {
      const hostPath = join(tempDir, "host-audit.jsonl");
      const viewerPath = join(tempDir, "viewer-audit.jsonl");
      writeFileSync(
        hostPath,
        jsonl(correlatedHostRecords())
      );
      writeFileSync(
        viewerPath,
        jsonl(correlatedViewerRecords())
      );

      const result = runMvpTrialEvidence({
        hostPath,
        viewerPath,
        expectedSessionId: "session001"
      });
      const text = formatMvpTrialEvidenceResult(result);
      const json = formatMvpTrialEvidenceJsonResult(result);
      const parsed = JSON.parse(json);

      expect(text).toContain("WinBridge two-PC MVP trial evidence passed.");
      expect(text).toContain("audit.host.records=9 accepted=9 denied=0 failed=0");
      expect(text).toContain("audit.viewer.records=4 accepted=4 denied=0 failed=0");
      expect(parsed.ok).toBe(true);
      expect(parsed.mode).toBe("evidence");
      expect(parsed.evidence.coverage).toEqual([
        "authorizationApproved",
        "authorizationActive",
        "screenCaptureRequested",
        "screenCaptureCompleted",
        "screenFrameSent",
        "screenFrameOutput",
        "inputSent",
        "inputApplied",
        "permissionRevoked",
        "disconnectObserved"
      ]);
      assertNoUnsafeOutput(text);
      assertNoUnsafeOutput(json);
      expect(text).not.toContain(tempDir);
      expect(json).not.toContain(tempDir);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("fails evidence mode when strict role-bound evidence is missing", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "winbridge-trial-"));
    try {
      const hostPath = join(tempDir, "host-audit.jsonl");
      const viewerPath = join(tempDir, "viewer-audit.jsonl");
      writeFileSync(hostPath, jsonl([auditRecord("agent-shell.authorization.approved", "accepted", "host", {
        authorizationStatus: "approved"
      })]));
      writeFileSync(
        viewerPath,
        jsonl([auditRecord("agent-shell.remote-interaction.screen-frame.output-written", "accepted", "viewer")])
      );

      let thrown: unknown;
      try {
        runMvpTrialEvidence({ hostPath, viewerPath, expectedSessionId: "session001" });
      } catch (error) {
        thrown = error;
      }

      expect(formatMvpTrialError(thrown)).toBe(
        [
          "WinBridge two-PC MVP trial failed. reason=missing-required-evidence",
          "missingEvidence=host.authorizationActive,host.screenCaptureRequested,host.screenCaptureCompleted,host.screenFrameSent,host.inputApplied,host.permissionRevoked,host.disconnectObserved,viewer.screenFrameOutput,viewer.inputSent,viewer.disconnectObserved"
        ].join("\n")
      );
      expect(JSON.parse(formatMvpTrialError(thrown, { json: true }))).toEqual({
        ok: false,
        reason: "missing-required-evidence",
        missingEvidence: [
          "host.authorizationActive",
          "host.screenCaptureRequested",
          "host.screenCaptureCompleted",
          "host.screenFrameSent",
          "host.inputApplied",
          "host.permissionRevoked",
          "host.disconnectObserved",
          "viewer.screenFrameOutput",
          "viewer.inputSent",
          "viewer.disconnectObserved"
        ]
      });
      expect(formatMvpTrialError(thrown)).not.toContain(tempDir);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("omits missing evidence metadata for unrelated trial failures", () => {
    const text = formatMvpTrialError(new Error("raw-secret-token"));
    const json = formatMvpTrialError(new Error("raw-secret-token"), { json: true });

    expect(text).toBe("WinBridge two-PC MVP trial failed. reason=malformed-record");
    expect(json).toBe('{"ok":false,"reason":"malformed-record"}');
    expect(text).not.toContain("missingEvidence");
    expect(json).not.toContain("missingEvidence");
    assertNoUnsafeOutput(text);
    assertNoUnsafeOutput(json);
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

function correlatedHostRecords() {
  return [
    auditRecord("agent-shell.authorization.approved", "accepted", "host", {
      authorizationId: "auth0001",
      authorizationStatus: "approved",
      visibleToHost: false
    }),
    auditRecord("agent-shell.authorization.active", "accepted", "host", {
      authorizationId: "auth0001",
      authorizationStatus: "active",
      visibleToHost: true
    }),
    auditRecord("agent-shell.remote-interaction.screen-capture.requested", "accepted", "host", {
      authorizationId: "auth0001",
      authorizationStatus: "active",
      frameId: "frame0001",
      sequence: 0
    }),
    auditRecord("agent-shell.remote-interaction.screen-capture.completed", "accepted", "host", {
      authorizationId: "auth0001",
      authorizationStatus: "active",
      frameId: "frame0001",
      sequence: 0
    }),
    auditRecord("agent-shell.remote-interaction.screen-frame.sent", "accepted", "host", {
      authorizationId: "auth0001",
      frameId: "frame0001",
      sequence: 0
    }),
    auditRecord("agent-shell.remote-interaction.input-event.application-requested", "accepted", "host", {
      authorizationId: "auth0001",
      authorizationStatus: "active",
      eventId: "input0001",
      sequence: 0
    }),
    auditRecord("agent-shell.remote-interaction.input-event.applied", "accepted", "host", {
      authorizationId: "auth0001",
      authorizationStatus: "active",
      eventId: "input0001",
      sequence: 0
    }),
    auditRecord("agent-shell.permission.revoked", "accepted", "host", {
      authorizationStatus: "active"
    }),
    auditRecord("agent-shell.session.disconnected", "accepted", "host")
  ];
}

function correlatedViewerRecords() {
  return [
    auditRecord("agent-shell.remote-interaction.screen-frame.output-requested", "accepted", "viewer", {
      authorizationId: "auth0001",
      frameId: "frame0001",
      sequence: 0
    }),
    auditRecord("agent-shell.remote-interaction.screen-frame.output-written", "accepted", "viewer", {
      authorizationId: "auth0001",
      frameId: "frame0001",
      sequence: 0
    }),
    auditRecord("agent-shell.remote-interaction.input-event.sent", "accepted", "viewer", {
      authorizationId: "auth0001",
      eventId: "input0001",
      sequence: 0
    }),
    auditRecord("agent-shell.session.disconnected", "accepted", "viewer")
  ];
}

function auditRecord(
  action: string,
  outcome = "accepted",
  actorType = "host",
  detail: Record<string, unknown> = {}
) {
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
      token: "raw-secret-token",
      ...detail
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
    "frame0001",
    "input0001",
    "Raw Secret Display Name",
    "raw-secret-token",
    "123-456",
    "ws://",
    "127.0.0.1",
    "latest.jpg",
    "35987",
    '"detail"'
  ]) {
    expect(output).not.toContain(unsafe);
  }
}
