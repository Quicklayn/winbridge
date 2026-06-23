import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import {
  extractViewerSurfaceMutationToken,
  formatMvpSessionSmokeError,
  formatMvpSessionSmokeJsonError,
  formatMvpSessionSmokeJsonSuccess,
  formatMvpSessionSmokeSuccess,
  hasUsableSmokeAuditLogContent,
  MvpSessionSmokeUsageError,
  parseMvpSessionSmokeArgs,
  createMvpSmokePlan,
  runMvpSessionSmokeCheck,
  stopSmokeProcesses,
  tryFetchSurfaceSignalReadiness,
  tryPostSurfaceInput,
  tryPostSurfaceKeyboardInput
} from "./mvp-session-smoke.mjs";

describe("MVP session smoke check", () => {
  it("parses bounded timeout options", () => {
    expect(parseMvpSessionSmokeArgs([])).toMatchObject({
      help: false,
      timeoutMs: 45_000,
      keepArtifacts: false,
      json: false
    });
    expect(parseMvpSessionSmokeArgs(["--timeout-ms", "5000"])).toMatchObject({
      timeoutMs: 5000,
      keepArtifacts: false,
      json: false
    });
    expect(parseMvpSessionSmokeArgs(["--keep-artifacts"])).toMatchObject({
      timeoutMs: 45_000,
      keepArtifacts: true,
      json: false
    });
    expect(
      parseMvpSessionSmokeArgs(["--json", "--keep-artifacts", "--timeout-ms", "5000"])
    ).toMatchObject({
      timeoutMs: 5000,
      keepArtifacts: true,
      json: true
    });
    expect(parseMvpSessionSmokeArgs(["--help"])).toEqual({ help: true });
  });

  it("rejects malformed options without echoing raw values", () => {
    let thrown: unknown;

    try {
      parseMvpSessionSmokeArgs(["--token", "raw-secret-token"]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(MvpSessionSmokeUsageError);
    expect(formatMvpSessionSmokeError(thrown)).not.toContain("raw-secret-token");
    expect(() => parseMvpSessionSmokeArgs(["--timeout-ms", "999"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(() => parseMvpSessionSmokeArgs(["--timeout-ms", "1000", "--timeout-ms", "1000"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(() => parseMvpSessionSmokeArgs(["--keep-artifacts", "true"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(() => parseMvpSessionSmokeArgs(["--keep-artifacts", "--keep-artifacts"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(() => parseMvpSessionSmokeArgs(["--json", "raw-secret-token"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(() => parseMvpSessionSmokeArgs(["--json", "--json"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(formatMvpSessionSmokeJsonError(thrown)).not.toContain("raw-secret-token");
  });

  it("formats retained artifact success output without sensitive runtime contents", () => {
    const output = formatMvpSessionSmokeSuccess(
      {
        ok: true,
        workDir: "C:\\Temp\\winbridge-mvp-smoke-safe",
        framePath: "C:\\Temp\\winbridge-mvp-smoke-safe\\frames\\latest.png",
        surfaceUrl: "http://127.0.0.1:35987/"
      },
      { keepArtifacts: true }
    );

    expect(output).toContain("WinBridge MVP smoke check passed.");
    expect(output).toContain("signal=verified");
    expect(output).toContain("audit=verified");
    expect(output).toContain("artifacts=C:\\Temp\\winbridge-mvp-smoke-safe");
    expect(output).not.toContain("latest.png");
    expect(output).not.toContain("host-audit.jsonl");
    expect(output).not.toContain("safe-token");
    expect(output).not.toContain("pointer-move 0.5 0.5");
    expect(output).not.toContain("key-down KeyA shift,control");
    expect(output).not.toContain("123-456");
    expect(output).not.toContain("relay.peer.join.accepted");
  });

  it("formats bounded JSON success output without sensitive runtime contents", () => {
    const output = formatMvpSessionSmokeJsonSuccess(
      {
        ok: true,
        workDir: "C:\\Temp\\winbridge-mvp-smoke-safe",
        framePath: "C:\\Temp\\winbridge-mvp-smoke-safe\\frames\\latest.png",
        surfaceUrl: "http://127.0.0.1:35987/"
      },
      { keepArtifacts: false }
    );
    const parsed = JSON.parse(output);

    expect(parsed).toEqual({
      ok: true,
      checks: [
        { name: "relay", ok: true },
        { name: "frame", ok: true },
        { name: "surface", ok: true },
        { name: "signal", ok: true },
        { name: "input", ok: true },
        { name: "audit", ok: true }
      ],
      artifacts: "cleaned"
    });
    expect(output).not.toContain("latest.png");
    expect(output).not.toContain("127.0.0.1:35987");
    expect(output).not.toContain("host-audit.jsonl");
    expect(output).not.toContain("safe-token");
    expect(output).not.toContain("pointer-move 0.5 0.5");
    expect(output).not.toContain("key-down KeyA shift,control");
    expect(output).not.toContain("123-456");
    expect(output).not.toContain("relay.peer.join.accepted");
  });

  it("formats retained artifact directory only when JSON artifacts are explicitly kept", () => {
    const output = formatMvpSessionSmokeJsonSuccess(
      {
        ok: true,
        workDir: "C:\\Temp\\winbridge-mvp-smoke-safe",
        framePath: "C:\\Temp\\winbridge-mvp-smoke-safe\\frames\\latest.png",
        surfaceUrl: "http://127.0.0.1:35987/"
      },
      { keepArtifacts: true }
    );
    const parsed = JSON.parse(output);

    expect(parsed.artifacts).toBe("retained");
    expect(parsed.artifactDir).toBe("C:\\Temp\\winbridge-mvp-smoke-safe");
    expect(output).not.toContain("latest.png");
    expect(output).not.toContain("127.0.0.1:35987");
  });

  it("formats bounded JSON failure output with safe known-step subchecks", () => {
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("signal-not-ready")))).toEqual({
      ok: false,
      reason: "signal-not-ready",
      checks: [
        { name: "relay", ok: true },
        { name: "frame", ok: true },
        { name: "surface", ok: true },
        { name: "signal", ok: false },
        { name: "input", ok: false, skipped: true },
        { name: "audit", ok: false, skipped: true }
      ]
    });
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("audit-not-ready")))).toEqual({
      ok: false,
      reason: "audit-not-ready",
      checks: [
        { name: "relay", ok: true },
        { name: "frame", ok: true },
        { name: "surface", ok: true },
        { name: "signal", ok: true },
        { name: "input", ok: true },
        { name: "audit", ok: false }
      ]
    });
    expect(formatMvpSessionSmokeJsonError(new Error("raw-secret-token"))).not.toContain(
      "raw-secret-token"
    );
  });

  it("keeps startup, usage, and unknown JSON failures bounded without subchecks", () => {
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("host-not-ready")))).toEqual({
      ok: false,
      reason: "host-not-ready"
    });
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("viewer-spawn-failed")))).toEqual({
      ok: false,
      reason: "viewer-spawn-failed"
    });
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new MvpSessionSmokeUsageError()))).toEqual({
      ok: false,
      reason: "usage"
    });
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("raw-secret-token")))).toEqual({
      ok: false
    });
  });

  it("builds a static local plan without Windows capture or OS input application", () => {
    const plan = createMvpSmokePlan({
      npmCommand: "npm",
      workDir: "C:\\Temp\\winbridge-smoke",
      relayPort: 18787,
      surfacePort: 35987,
      session: "smoke-test"
    });
    const serialized = JSON.stringify(plan);

    expect(plan.relay.args).toEqual(["--workspace", "@winbridge/relay", "run", "dev"]);
    expect(plan.relay.env).toEqual({ WINBRIDGE_RELAY_PORT: "18787" });
    expect(plan.host.args).toContain("--host-decision");
    expect(plan.host.args).toContain("approve");
    expect(plan.host.args).toContain("--visible-session");
    expect(plan.host.args).toContain("true");
    expect(plan.host.args).toContain("--host-signal-probe-ack");
    expect(plan.host.args).toContain("--dev-screen-frame-source");
    expect(plan.host.args).toContain("static");
    expect(plan.viewer.args).toContain("--viewer-signal-probe-after-ms");
    expect(plan.viewer.args).toContain("0");
    expect(plan.viewer.args).toContain("--viewer-control-surface-port");
    expect(plan.hostAuditPath).toBe("C:\\Temp\\winbridge-smoke\\logs\\host-audit.jsonl");
    expect(plan.viewerAuditPath).toBe("C:\\Temp\\winbridge-smoke\\logs\\viewer-audit.jsonl");
    expect(plan.surfaceUrl).toBe("http://127.0.0.1:35987/");
    expect(serialized).not.toContain("windows-capture");
    expect(serialized).not.toContain("host-apply-input");
    expect(serialized).not.toContain("Start-Process");
    expect(serialized).not.toContain("playwright");
    expect(serialized).not.toContain("browser");
    expect(serialized).not.toContain("host-signal-probe-ack-secret");
    expect(serialized).not.toContain("viewer-signal-probe-raw");
  });

  it("extracts only bounded viewer surface mutation tokens", () => {
    expect(
      extractViewerSurfaceMutationToken('const mutationToken = "safe_token-1234567890";')
    ).toBe("safe_token-1234567890");
    expect(extractViewerSurfaceMutationToken('const mutationToken = "raw token";')).toBeUndefined();
    expect(extractViewerSurfaceMutationToken("raw-token")).toBeUndefined();
    expect(formatMvpSessionSmokeError(new Error("input-not-ready"))).not.toContain("raw-token");
  });

  it("posts a bounded pointer command through the token-protected surface input path", async () => {
    const calls: unknown[] = [];
    const accepted = await tryPostSurfaceInput(
      async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return {
          status: 202,
          json: async () => ({ ok: true, action: "input", kind: "pointer-move" })
        } as Response;
      },
      "http://127.0.0.1:35987/",
      "safe-token"
    );

    expect(accepted).toBe(true);
    expect(calls).toEqual([
      {
        url: "http://127.0.0.1:35987/input",
        init: {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "http://127.0.0.1:35987",
            "x-winbridge-local-surface-token": "safe-token"
          },
          body: JSON.stringify({ command: "pointer-move 0.5 0.5" })
        }
      }
    ]);
  });

  it("posts a bounded keyboard modifier command through the token-protected surface input path", async () => {
    const calls: unknown[] = [];
    const accepted = await tryPostSurfaceKeyboardInput(
      async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return {
          status: 202,
          json: async () => ({ ok: true, action: "input", kind: "key-down" })
        } as Response;
      },
      "http://127.0.0.1:35987/",
      "safe-token"
    );

    expect(accepted).toBe(true);
    expect(calls).toEqual([
      {
        url: "http://127.0.0.1:35987/input",
        init: {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "http://127.0.0.1:35987",
            "x-winbridge-local-surface-token": "safe-token"
          },
          body: JSON.stringify({ command: "key-down KeyA shift,control" })
        }
      }
    ]);
    expect(formatMvpSessionSmokeError(new Error("input-not-ready"))).not.toContain("KeyA");
    expect(formatMvpSessionSmokeJsonError(new Error("input-not-ready"))).not.toContain("shift");
    expect(formatMvpSessionSmokeJsonError(new Error("input-not-ready"))).not.toContain("control");
  });

  it("rejects unexpected keyboard surface input responses without exposing command details", async () => {
    const accepted = await tryPostSurfaceKeyboardInput(
      async () =>
        ({
          status: 202,
          json: async () => ({
            ok: true,
            action: "input",
            kind: "key-up",
            command: "key-down KeyA shift,control"
          })
        }) as Response,
      "http://127.0.0.1:35987/",
      "safe-token"
    );

    expect(accepted).toBe(false);
    expect(formatMvpSessionSmokeJsonError(new Error("input-not-ready"))).not.toContain("KeyA");
    expect(formatMvpSessionSmokeJsonError(new Error("input-not-ready"))).not.toContain("key-down");
  });

  it("checks signal readiness through sanitized viewer status only", async () => {
    const calls: unknown[] = [];
    const ready = await tryFetchSurfaceSignalReadiness(
      async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return {
          ok: true,
          json: async () => ({
            ok: true,
            state: {
              signalProbeAckReceived: true,
              authorizationId: "authz_private",
              signalKind: "host-signal-probe-ack"
            }
          })
        } as Response;
      },
      "http://127.0.0.1:35987/"
    );

    expect(ready).toBe(true);
    expect(calls).toEqual([
      {
        url: "http://127.0.0.1:35987/status",
        init: { cache: "no-store" }
      }
    ]);
    expect(formatMvpSessionSmokeError(new Error("signal-not-ready"))).toBe(
      "WinBridge MVP smoke check failed. reason=signal-not-ready"
    );
    expect(formatMvpSessionSmokeError(new Error("authz_private"))).not.toContain("authz_private");
  });

  it("rejects missing signal readiness without exposing raw status data", async () => {
    const ready = await tryFetchSurfaceSignalReadiness(
      async () =>
        ({
          ok: true,
          json: async () => ({
            ok: true,
            state: {
              signalProbeAckReceived: false,
              authorizationId: "authz_private",
              rawSignalMarker: "viewer-signal-probe-raw"
            }
          })
        }) as Response,
      "http://127.0.0.1:35987/"
    );

    expect(ready).toBe(false);
    expect(formatMvpSessionSmokeJsonError(new Error("signal-not-ready"))).not.toContain(
      "viewer-signal-probe-raw"
    );
    expect(formatMvpSessionSmokeJsonError(new Error("signal-not-ready"))).not.toContain(
      "authz_private"
    );
  });

  it("accepts bounded schema-like smoke audit records without exposing raw contents", () => {
    const auditLine = JSON.stringify({
      eventId: "audit_safe123",
      timestamp: "2026-06-22T08:00:00.000Z",
      actor: { type: "host", id: "host-smoke" },
      action: "agent-shell.authorization.active",
      outcome: "accepted",
      detail: { authorizationId: "authz_safe" }
    });

    expect(hasUsableSmokeAuditLogContent(`${auditLine}\n`)).toBe(true);
    expect(
      hasUsableSmokeAuditLogContent(
        '{"eventId":"short","timestamp":"not-a-date","action":"raw-token","outcome":"accepted"}\n'
      )
    ).toBe(false);
    expect(formatMvpSessionSmokeError(new Error("audit-not-ready"))).toBe(
      "WinBridge MVP smoke check failed. reason=audit-not-ready"
    );
    expect(formatMvpSessionSmokeJsonError(new Error("audit-not-ready"))).not.toContain(
      "authz_safe"
    );
    expect(formatMvpSessionSmokeJsonError(new Error("audit-not-ready"))).not.toContain(
      "agent-shell.authorization.active"
    );
  });

  it("stops child processes in reverse start order", async () => {
    const killed: number[] = [];
    const handles = [
      fakeHandle("relay", 100),
      fakeHandle("host", 101),
      fakeHandle("viewer", 102)
    ];

    await stopSmokeProcesses(handles, async (pid) => {
      killed.push(pid);
    });

    expect(killed).toEqual([102, 101, 100]);
  });

  it("cleans up started children when the smoke check fails", async () => {
    const killed: number[] = [];
    const spawned: string[] = [];
    let relayChild: ReturnType<typeof fakeChild> | undefined;
    let now = 0;

    await expect(
      runMvpSessionSmokeCheck({
        cwd: "C:\\repo",
        workDir: "C:\\Temp\\missing-frame",
        relayPort: 18787,
        surfacePort: 35987,
        timeoutMs: 1000,
        keepArtifacts: true,
        now: () => now,
        sleep: async (ms: number) => {
          now += ms;
        },
        spawnProcess: (command: string, args: string[]) => {
          spawned.push([command, ...args].join(" "));
          const child = fakeChild(200 + spawned.length);
          if (spawned.length === 1) {
            relayChild = child;
          }
          if (spawned.length === 2) {
            relayChild?.stdout.emit(
              "data",
              'relay.peer.join.accepted host-smoke pairingTicketCreated'
            );
          }
          return child;
        },
        killProcessTree: async (pid: number) => {
          killed.push(pid);
        }
      })
    ).rejects.toThrow("WinBridge MVP smoke check failed.");

    expect(spawned).toHaveLength(3);
    expect(killed).toEqual([203, 202, 201]);
  });

  it("cleans up started children when interrupted", async () => {
    const signalTarget = new EventEmitter();
    const killed: number[] = [];
    let spawned = 0;
    let relayChild: ReturnType<typeof fakeChild> | undefined;
    let now = 0;
    let interrupted = false;

    await expect(
      runMvpSessionSmokeCheck({
        cwd: "C:\\repo",
        workDir: "C:\\Temp\\interrupted-smoke",
        relayPort: 18787,
        surfacePort: 35987,
        timeoutMs: 5000,
        keepArtifacts: true,
        signalTarget,
        now: () => now,
        sleep: async (ms: number) => {
          now += ms;
          if (!interrupted && spawned === 3) {
            interrupted = true;
            signalTarget.emit("SIGINT", "SIGINT");
          }
        },
        spawnProcess: () => {
          spawned += 1;
          const child = fakeChild(300 + spawned);
          if (spawned === 1) {
            relayChild = child;
          }
          if (spawned === 2) {
            relayChild?.stdout.emit(
              "data",
              'relay.peer.join.accepted host-smoke pairingTicketCreated'
            );
          }
          return child;
        },
        killProcessTree: async (pid: number) => {
          killed.push(pid);
        }
      })
    ).rejects.toThrow("WinBridge MVP smoke check failed.");

    expect(spawned).toBe(3);
    expect(killed).toEqual([303, 302, 301]);
    expect(signalTarget.listenerCount("SIGINT")).toBe(0);
    expect(signalTarget.listenerCount("SIGTERM")).toBe(0);
  });
});

function fakeHandle(label: string, pid: number) {
  return {
    label,
    child: fakeChild(pid),
    output: "",
    exited: false,
    exitCode: undefined
  };
}

function fakeChild(pid: number) {
  const child = new EventEmitter() as EventEmitter & {
    pid: number;
    stdout: EventEmitter;
    stderr: EventEmitter;
  };
  child.pid = pid;
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  return child;
}
