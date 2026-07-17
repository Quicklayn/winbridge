import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
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
const EXPECTED_SESSION_ID = "session001";
const AUTHORIZATION_ID = "auth0001";
const FRAME_ID = "frame0001";
const INPUT_EVENT_ID = "input0001";

describe("MVP audit summary", () => {
  it("parses non-strict paths and requires an explicit session in strict mode", () => {
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
      expectedSessionId: undefined,
      json: false,
      requireMvpEvidence: false
    });
    expect(
      parseMvpAuditSummaryArgs([
        "--json",
        "--require-mvp-evidence",
        "--session",
        EXPECTED_SESSION_ID,
        "--viewer",
        String.raw`logs\viewer-audit.jsonl`,
        "--host",
        String.raw`logs\host-audit.jsonl`
      ])
    ).toMatchObject({
      expectedSessionId: EXPECTED_SESSION_ID,
      json: true,
      requireMvpEvidence: true
    });
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
        "--require-mvp-evidence"
      ],
      [
        "--host",
        String.raw`logs\host-audit.jsonl`,
        "--viewer",
        String.raw`logs\viewer-audit.jsonl`,
        "--session",
        EXPECTED_SESSION_ID,
        "--session",
        "raw-secret-token",
        "--require-mvp-evidence"
      ],
      [
        "--host",
        String.raw`logs\host-audit.jsonl`,
        "--viewer",
        String.raw`logs\viewer-audit.jsonl`,
        "--session",
        " raw-secret-token ",
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

  it("rejects strict programmatic checks without a session before reading files", () => {
    let readAttempted = false;
    expect(() =>
      runMvpAuditSummaryCheck({
        hostPath: String.raw`logs\host-audit.jsonl`,
        viewerPath: String.raw`logs\viewer-audit.jsonl`,
        requireMvpEvidence: true,
        stat: () => ({ size: 1 }),
        readText: () => {
          readAttempted = true;
          return "";
        }
      })
    ).toThrow(MvpAuditSummaryUsageError);
    expect(readAttempted).toBe(false);
  });

  it("summarizes and verifies one correlated session without rendering identifiers", () => {
    withAuditFiles(
      correlatedHostRecords(),
      [
        ...correlatedViewerRecords(),
        auditRecord(
          "agent-shell.remote-interaction.input-event.sent",
          "viewer",
          { authorizationId: AUTHORIZATION_ID, eventId: "denied0001", sequence: 2 },
          { outcome: "denied" }
        )
      ],
      ({ hostPath, viewerPath }) => {
        const result = runMvpAuditSummaryCheck({
          hostPath,
          viewerPath,
          expectedSessionId: EXPECTED_SESSION_ID,
          requireMvpEvidence: true
        });
        const text = formatMvpAuditSummaryResult(result);
        const parsed = JSON.parse(formatMvpAuditSummaryJsonResult(result));

        expect(text).toBe(
          [
            "WinBridge MVP audit summary passed.",
            "audit.host.records=9 accepted=9 denied=0 failed=0",
            "audit.viewer.records=5 accepted=4 denied=1 failed=0",
            "audit.coverage=authorizationApproved,authorizationActive,screenCaptureRequested,screenCaptureCompleted,screenFrameSent,screenFrameOutput,inputSent,inputApplied,permissionRevoked,disconnectObserved",
            "safety=bounded-metadata-only"
          ].join("\n")
        );
        expect(parsed).toEqual({
          ok: true,
          roles: {
            host: {
              records: 9,
              accepted: 9,
              denied: 0,
              failed: 0,
              authorizationApproved: true,
              authorizationActive: true,
              screenCaptureRequested: true,
              screenCaptureCompleted: true,
              screenFrameSent: true,
              screenFrameOutput: false,
              inputSent: false,
              inputApplied: true,
              permissionRevoked: true,
              disconnectObserved: true
            },
            viewer: {
              records: 5,
              accepted: 4,
              denied: 1,
              failed: 0,
              authorizationApproved: false,
              authorizationActive: false,
              screenCaptureRequested: false,
              screenCaptureCompleted: false,
              screenFrameSent: false,
              screenFrameOutput: true,
              inputSent: true,
              inputApplied: false,
              permissionRevoked: false,
              disconnectObserved: true
            }
          },
          coverage: [
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
          ]
        });
        assertNoUnsafeOutput(text);
        assertNoUnsafeOutput(JSON.stringify(parsed));
      }
    );
  });

  it("reports deterministic bounded missing evidence for an incomplete chain", () => {
    withAuditFiles(
      [
        auditRecord("agent-shell.authorization.approved", "host", {
          authorizationId: AUTHORIZATION_ID,
          authorizationStatus: "approved"
        }),
        auditRecord("agent-shell.authorization.active", "host", {
          authorizationId: AUTHORIZATION_ID,
          authorizationStatus: "active",
          visibleToHost: true
        })
      ],
      [
        auditRecord("agent-shell.remote-interaction.screen-frame.output-written", "viewer", {
          authorizationId: AUTHORIZATION_ID,
          frameId: FRAME_ID,
          sequence: 0
        })
      ],
      ({ hostPath, viewerPath }) => {
        const partial = runMvpAuditSummaryCheck({ hostPath, viewerPath });
        expect(partial.coverage).toEqual([
          "authorizationApproved",
          "authorizationActive",
          "screenFrameOutput"
        ]);

        let thrown: unknown;
        try {
          runMvpAuditSummaryCheck({
            hostPath,
            viewerPath,
            expectedSessionId: EXPECTED_SESSION_ID,
            requireMvpEvidence: true
          });
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(MvpAuditSummaryError);
        const expectedMissing = [
          "host.screenCaptureRequested",
          "host.screenCaptureCompleted",
          "host.screenFrameSent",
          "host.inputApplied",
          "host.permissionRevoked",
          "host.disconnectObserved",
          "viewer.screenFrameOutput",
          "viewer.inputSent",
          "viewer.disconnectObserved"
        ];
        expect(formatMvpAuditSummaryError(thrown)).toBe(
          [
            "WinBridge MVP audit summary failed. reason=missing-required-evidence",
            `missingEvidence=${expectedMissing.join(",")}`
          ].join("\n")
        );
        expect(JSON.parse(formatMvpAuditSummaryJsonError(thrown))).toEqual({
          ok: false,
          reason: "missing-required-evidence",
          missingEvidence: expectedMissing
        });
        assertNoUnsafeOutput(formatMvpAuditSummaryError(thrown));
        assertNoUnsafeOutput(formatMvpAuditSummaryJsonError(thrown));
      }
    );
  });

  it("fails closed for mixed, reordered, uncorrelated, or non-success evidence", () => {
    const scenarios: Array<{
      name: string;
      mutate(host: AuditRecord[], viewer: AuditRecord[]): void;
    }> = [
      {
        name: "mixed sessions",
        mutate(host) {
          for (const record of host.slice(2)) {
            record.sessionId = "session002";
          }
        }
      },
      {
        name: "mixed authorizations",
        mutate(host) {
          for (const record of host.slice(3)) {
            record.detail.authorizationId = "auth0002";
          }
        }
      },
      {
        name: "frame sent before capture",
        mutate(host) {
          [host[2], host[4]] = [host[4], host[2]];
        }
      },
      {
        name: "missing capture request",
        mutate(host) {
          host.splice(2, 1);
        }
      },
      {
        name: "missing capture completion",
        mutate(host) {
          host.splice(3, 1);
        }
      },
      {
        name: "failed capture completion cannot count",
        mutate(host) {
          host[3].outcome = "failed";
        }
      },
      {
        name: "missing input application request",
        mutate(host) {
          host.splice(5, 1);
        }
      },
      {
        name: "mismatched viewer frame",
        mutate(_host, viewer) {
          viewer[0].detail.frameId = "frame0002";
        }
      },
      {
        name: "mismatched viewer input",
        mutate(_host, viewer) {
          viewer[2].detail.eventId = "input0002";
        }
      },
      {
        name: "wrong actor role",
        mutate(host) {
          host[1].actor.type = "viewer";
        }
      },
      {
        name: "adapter failure cannot count as applied",
        mutate(host) {
          host[6].outcome = "failed";
        }
      },
      {
        name: "viewer output failure cannot count as written",
        mutate(_host, viewer) {
          viewer[1].outcome = "failed";
        }
      },
      {
        name: "legacy output written without request",
        mutate(_host, viewer) {
          viewer.splice(0, 1);
        }
      },
      {
        name: "viewer output written before request",
        mutate(_host, viewer) {
          [viewer[0], viewer[1]] = [viewer[1], viewer[0]];
        }
      },
      {
        name: "terminal authorization before capture",
        mutate(host) {
          host.splice(2, 0, auditRecord("agent-shell.authorization.terminated", "host", {
            authorizationId: AUTHORIZATION_ID,
            authorizationStatus: "terminated"
          }));
        }
      },
      {
        name: "expired authorization before capture",
        mutate(host) {
          host.splice(2, 0, auditRecord("agent-shell.authorization.expired", "host", {
            authorizationId: AUTHORIZATION_ID,
            authorizationStatus: "expired"
          }));
        }
      },
      {
        name: "revocation before input",
        mutate(host) {
          host.splice(5, 0, auditRecord("agent-shell.permission.revoked", "host", {
            authorizationId: AUTHORIZATION_ID,
            authorizationStatus: "active"
          }));
        }
      },
      {
        name: "host disconnect before input",
        mutate(host) {
          host.splice(5, 0, auditRecord("agent-shell.session.disconnected", "host", {
            authorizationId: AUTHORIZATION_ID,
            authorizationStatus: "active"
          }));
        }
      },
      {
        name: "viewer disconnect before output",
        mutate(_host, viewer) {
          viewer.splice(0, 0, auditRecord("agent-shell.session.disconnected", "viewer", {
            authorizationId: AUTHORIZATION_ID,
            authorizationStatus: "active"
          }));
        }
      },
      {
        name: "pause without resume before capture",
        mutate(host) {
          host.splice(2, 0, auditRecord("agent-shell.authorization.paused", "host", {
            authorizationId: AUTHORIZATION_ID,
            authorizationStatus: "paused"
          }));
        }
      }
    ];

    for (const scenario of scenarios) {
      const host = correlatedHostRecords();
      const viewer = correlatedViewerRecords();
      scenario.mutate(host, viewer);
      withAuditFiles(host, viewer, ({ hostPath, viewerPath }) => {
        let thrown: unknown;
        try {
          runMvpAuditSummaryCheck({
            hostPath,
            viewerPath,
            expectedSessionId: EXPECTED_SESSION_ID,
            requireMvpEvidence: true
          });
        } catch (error) {
          thrown = error;
        }

        expect(thrown, scenario.name).toBeInstanceOf(MvpAuditSummaryError);
        expect((thrown as MvpAuditSummaryError).reason, scenario.name).toBe(
          "missing-required-evidence"
        );
        const text = formatMvpAuditSummaryError(thrown);
        const json = formatMvpAuditSummaryJsonError(thrown);
        expect(text, scenario.name).toContain("missingEvidence=");
        expect(JSON.parse(json).missingEvidence.length, scenario.name).toBeGreaterThan(0);
        assertNoUnsafeOutput(text);
        assertNoUnsafeOutput(json);
      });
    }
  });

  it("accepts native milestones after a correlated pause and resume", () => {
    const host = correlatedHostRecords();
    host.splice(
      2,
      0,
      auditRecord("agent-shell.authorization.paused", "host", {
        authorizationId: AUTHORIZATION_ID,
        authorizationStatus: "paused"
      }),
      auditRecord("agent-shell.authorization.resumed", "host", {
        authorizationId: AUTHORIZATION_ID,
        authorizationStatus: "active"
      })
    );

    withAuditFiles(host, correlatedViewerRecords(), ({ hostPath, viewerPath }) => {
      expect(
        runMvpAuditSummaryCheck({
          hostPath,
          viewerPath,
          expectedSessionId: EXPECTED_SESSION_ID,
          requireMvpEvidence: true
        }).ok
      ).toBe(true);
    });
  });

  it("keeps non-strict action coverage available for wrong-role records", () => {
    withAuditFiles(
      correlatedViewerRecords().map((record) => ({
        ...record,
        actor: { ...record.actor, type: "host" }
      })),
      correlatedHostRecords().map((record) => ({
        ...record,
        actor: { ...record.actor, type: "viewer" }
      })),
      ({ hostPath, viewerPath }) => {
        const partial = runMvpAuditSummaryCheck({ hostPath, viewerPath });
        expect(partial.coverage).toEqual([
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
        expect(() =>
          runMvpAuditSummaryCheck({
            hostPath,
            viewerPath,
            expectedSessionId: EXPECTED_SESSION_ID,
            requireMvpEvidence: true
          })
        ).toThrow(MvpAuditSummaryError);
      }
    );
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
    expect(() => summarizeAuditSummaryContent("host", `${"a".repeat(4097)}\n`)).toThrow(
      MvpAuditSummaryError
    );
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
      expect(text).not.toContain("missingEvidence=");
      expect(json).not.toContain("missingEvidence");
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

type AuditRecord = ReturnType<typeof auditRecord>;

function correlatedHostRecords(): AuditRecord[] {
  return [
    auditRecord("agent-shell.authorization.approved", "host", {
      authorizationId: AUTHORIZATION_ID,
      authorizationStatus: "approved",
      visibleToHost: false
    }),
    auditRecord("agent-shell.authorization.active", "host", {
      authorizationId: AUTHORIZATION_ID,
      authorizationStatus: "active",
      visibleToHost: true
    }),
    auditRecord("agent-shell.remote-interaction.screen-capture.requested", "host", {
      authorizationId: AUTHORIZATION_ID,
      authorizationStatus: "active",
      frameId: FRAME_ID,
      sequence: 0,
      visibleToHost: true
    }),
    auditRecord("agent-shell.remote-interaction.screen-capture.completed", "host", {
      authorizationId: AUTHORIZATION_ID,
      authorizationStatus: "active",
      frameId: FRAME_ID,
      sequence: 0,
      visibleToHost: true
    }),
    auditRecord("agent-shell.remote-interaction.screen-frame.sent", "host", {
      authorizationId: AUTHORIZATION_ID,
      frameId: FRAME_ID,
      sequence: 0
    }),
    auditRecord("agent-shell.remote-interaction.input-event.application-requested", "host", {
      authorizationId: AUTHORIZATION_ID,
      authorizationStatus: "active",
      eventId: INPUT_EVENT_ID,
      sequence: 0
    }),
    auditRecord("agent-shell.remote-interaction.input-event.applied", "host", {
      authorizationId: AUTHORIZATION_ID,
      authorizationStatus: "active",
      eventId: INPUT_EVENT_ID,
      sequence: 0
    }),
    auditRecord("agent-shell.permission.revoked", "host", {
      authorizationId: AUTHORIZATION_ID,
      authorizationStatus: "active"
    }),
    auditRecord("agent-shell.session.disconnected", "host", {
      authorizationId: AUTHORIZATION_ID,
      authorizationStatus: "active"
    })
  ];
}

function correlatedViewerRecords(): AuditRecord[] {
  return [
    auditRecord("agent-shell.remote-interaction.screen-frame.output-requested", "viewer", {
      authorizationId: AUTHORIZATION_ID,
      frameId: FRAME_ID,
      sequence: 0
    }),
    auditRecord("agent-shell.remote-interaction.screen-frame.output-written", "viewer", {
      authorizationId: AUTHORIZATION_ID,
      frameId: FRAME_ID,
      sequence: 0
    }),
    auditRecord("agent-shell.remote-interaction.input-event.sent", "viewer", {
      authorizationId: AUTHORIZATION_ID,
      eventId: INPUT_EVENT_ID,
      sequence: 0
    }),
    auditRecord("agent-shell.session.disconnected", "viewer", {
      authorizationId: AUTHORIZATION_ID,
      authorizationStatus: "active"
    })
  ];
}

function auditRecord(
  action: string,
  actorType = "host",
  detail: Record<string, unknown> = {},
  options: { outcome?: string; sessionId?: string } = {}
) {
  return {
    eventId: "audit0001",
    timestamp: "2026-01-01T00:00:00.000Z",
    actor: {
      type: actorType,
      id: `${actorType}001`
    },
    action,
    outcome: options.outcome ?? "accepted",
    sessionId: options.sessionId ?? EXPECTED_SESSION_ID,
    target: {
      type: "authorization",
      id: AUTHORIZATION_ID
    },
    detail: {
      displayName: "Raw Secret Display Name",
      pointer: { x: 0.5, y: 0.5 },
      token: "raw-secret-token",
      ...detail
    }
  };
}

function withAuditFiles(
  hostRecords: unknown[],
  viewerRecords: unknown[],
  callback: (paths: { hostPath: string; viewerPath: string }) => void
) {
  const tempDir = mkdtempSync(join(tmpdir(), "winbridge-audit-summary-"));
  try {
    const hostPath = join(tempDir, "host-audit.jsonl");
    const viewerPath = join(tempDir, "viewer-audit.jsonl");
    writeFileSync(hostPath, jsonl(hostRecords));
    writeFileSync(viewerPath, jsonl(viewerRecords));
    callback({ hostPath, viewerPath });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function jsonl(records: unknown[]) {
  return `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
}

function assertNoUnsafeOutput(output: string) {
  for (const unsafe of [
    "audit0001",
    "host001",
    "viewer001",
    EXPECTED_SESSION_ID,
    "session002",
    AUTHORIZATION_ID,
    "auth0002",
    FRAME_ID,
    "frame0002",
    INPUT_EVENT_ID,
    "input0002",
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
