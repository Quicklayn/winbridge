import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createSmokeProcessEnvironment,
  extractViewerSurfaceUrlFromOutput,
  extractViewerSurfaceMutationToken,
  formatMvpSessionSmokeError,
  formatMvpSessionSmokeJsonError,
  formatMvpSessionSmokeJsonSuccess,
  formatMvpSessionSmokeSuccess,
  hasActiveVisibleHostIndicatorOutput,
  hasUsableSmokeAuditLogContent,
  MvpSessionSmokeUsageError,
  parseMvpSessionSmokeArgs,
  createMvpSmokePlan,
  resolveMvpSmokeTokenEnv,
  runMvpSessionSmokeCheck,
  stopSmokeProcesses,
  summarizeSmokeAuditLogContent,
  tryFetchSurfaceHostGuardRejection,
  tryFetchSurfaceSignalReadiness,
  tryPostSurfaceGuardDenials,
  tryPostSurfaceInput,
  tryPostSurfaceInputDenied,
  tryPostSurfaceDisconnect,
  tryPostSurfaceKeyboardInput
} from "./mvp-session-smoke.mjs";

describe("MVP session smoke check", () => {
  it("parses bounded timeout options", () => {
    expect(parseMvpSessionSmokeArgs([])).toMatchObject({
      help: false,
      timeoutMs: 45_000,
      keepArtifacts: false,
      lanRelay: false,
      windowsCapture: false,
      json: false
    });
    expect(parseMvpSessionSmokeArgs(["--timeout-ms", "5000"])).toMatchObject({
      timeoutMs: 5000,
      keepArtifacts: false,
      lanRelay: false,
      windowsCapture: false,
      json: false
    });
    expect(parseMvpSessionSmokeArgs(["--keep-artifacts"])).toMatchObject({
      timeoutMs: 45_000,
      keepArtifacts: true,
      lanRelay: false,
      windowsCapture: false,
      json: false
    });
    expect(
      parseMvpSessionSmokeArgs([
        "--json",
        "--keep-artifacts",
        "--lan-relay",
        "--windows-capture",
        "--token-env",
        "WINBRIDGE_TEST_RELAY_TOKEN",
        "--timeout-ms",
        "5000"
      ])
    ).toMatchObject({
      timeoutMs: 5000,
      keepArtifacts: true,
      lanRelay: true,
      windowsCapture: true,
      tokenEnv: "WINBRIDGE_TEST_RELAY_TOKEN",
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
    expect(() => parseMvpSessionSmokeArgs(["--lan-relay", "--lan-relay"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(() => parseMvpSessionSmokeArgs(["--windows-capture", "--windows-capture"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(() => parseMvpSessionSmokeArgs(["--json", "raw-secret-token"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(() => parseMvpSessionSmokeArgs(["--json", "--json"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(() => parseMvpSessionSmokeArgs(["--token-env"])).toThrow(MvpSessionSmokeUsageError);
    expect(() => parseMvpSessionSmokeArgs(["--token-env", "relay-token"])).toThrow(
      MvpSessionSmokeUsageError
    );
    expect(() =>
      parseMvpSessionSmokeArgs([
        "--token-env",
        "WINBRIDGE_TEST_RELAY_TOKEN",
        "--token-env",
        "WINBRIDGE_OTHER_TOKEN"
      ])
    ).toThrow(MvpSessionSmokeUsageError);
    expect(formatMvpSessionSmokeJsonError(thrown)).not.toContain("raw-secret-token");
  });

  it("resolves token-env values without echoing unsafe values", () => {
    expect(
      resolveMvpSmokeTokenEnv(
        { WINBRIDGE_TEST_RELAY_TOKEN: "dev-shared-token" },
        "WINBRIDGE_TEST_RELAY_TOKEN"
      )
    ).toBe("dev-shared-token");
    expect(resolveMvpSmokeTokenEnv({}, undefined)).toBeUndefined();

    for (const env of [
      {},
      { WINBRIDGE_TEST_RELAY_TOKEN: "" },
      { WINBRIDGE_TEST_RELAY_TOKEN: " raw-secret-token" },
      { WINBRIDGE_TEST_RELAY_TOKEN: "raw-secret-token\n" },
      { WINBRIDGE_TEST_RELAY_TOKEN: "x".repeat(1025) },
      { WINBRIDGE_TEST_RELAY_TOKEN: `safe\u200Btoken` }
    ]) {
      let thrown: unknown;
      try {
        resolveMvpSmokeTokenEnv(env, "WINBRIDGE_TEST_RELAY_TOKEN");
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(MvpSessionSmokeUsageError);
      expect(formatMvpSessionSmokeError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpSessionSmokeJsonError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpSessionSmokeError(thrown)).not.toContain("safe\u200Btoken");
    }
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
    expect(output).toContain("surface-guards=verified");
    expect(output).toContain("audit=verified");
    expect(output).toContain("lifecycle=verified");
    expect(output).toContain("viewer-disconnect=verified");
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
        { name: "indicator", ok: true },
        { name: "frame", ok: true },
        { name: "surface", ok: true },
        { name: "signal", ok: true },
        { name: "surface-guards", ok: true },
        { name: "input", ok: true },
        { name: "audit", ok: true },
        { name: "lifecycle", ok: true },
        { name: "viewer-disconnect", ok: true }
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
        { name: "indicator", ok: true },
        { name: "frame", ok: true },
        { name: "surface", ok: true },
        { name: "signal", ok: false },
        { name: "surface-guards", ok: false, skipped: true },
        { name: "input", ok: false, skipped: true },
        { name: "audit", ok: false, skipped: true },
        { name: "lifecycle", ok: false, skipped: true },
        { name: "viewer-disconnect", ok: false, skipped: true }
      ]
    });
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("surface-guards-not-ready")))).toEqual({
      ok: false,
      reason: "surface-guards-not-ready",
      checks: [
        { name: "relay", ok: true },
        { name: "indicator", ok: true },
        { name: "frame", ok: true },
        { name: "surface", ok: true },
        { name: "signal", ok: true },
        { name: "surface-guards", ok: false },
        { name: "input", ok: false, skipped: true },
        { name: "audit", ok: false, skipped: true },
        { name: "lifecycle", ok: false, skipped: true },
        { name: "viewer-disconnect", ok: false, skipped: true }
      ]
    });
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("audit-not-ready")))).toEqual({
      ok: false,
      reason: "audit-not-ready",
      checks: [
        { name: "relay", ok: true },
        { name: "indicator", ok: true },
        { name: "frame", ok: true },
        { name: "surface", ok: true },
        { name: "signal", ok: true },
        { name: "surface-guards", ok: true },
        { name: "input", ok: true },
        { name: "audit", ok: false },
        { name: "lifecycle", ok: false, skipped: true },
        { name: "viewer-disconnect", ok: false, skipped: true }
      ]
    });
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("lifecycle-not-ready")))).toEqual({
      ok: false,
      reason: "lifecycle-not-ready",
      checks: [
        { name: "relay", ok: true },
        { name: "indicator", ok: true },
        { name: "frame", ok: true },
        { name: "surface", ok: true },
        { name: "signal", ok: true },
        { name: "surface-guards", ok: true },
        { name: "input", ok: true },
        { name: "audit", ok: true },
        { name: "lifecycle", ok: false },
        { name: "viewer-disconnect", ok: false, skipped: true }
      ]
    });
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("viewer-disconnect-not-ready")))).toEqual({
      ok: false,
      reason: "viewer-disconnect-not-ready",
      checks: [
        { name: "relay", ok: true },
        { name: "indicator", ok: true },
        { name: "frame", ok: true },
        { name: "surface", ok: true },
        { name: "signal", ok: true },
        { name: "surface-guards", ok: true },
        { name: "input", ok: true },
        { name: "audit", ok: true },
        { name: "lifecycle", ok: true },
        { name: "viewer-disconnect", ok: false }
      ]
    });
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("indicator-not-ready")))).toEqual({
      ok: false,
      reason: "indicator-not-ready",
      checks: [
        { name: "relay", ok: true },
        { name: "indicator", ok: false },
        { name: "frame", ok: false, skipped: true },
        { name: "surface", ok: false, skipped: true },
        { name: "signal", ok: false, skipped: true },
        { name: "surface-guards", ok: false, skipped: true },
        { name: "input", ok: false, skipped: true },
        { name: "audit", ok: false, skipped: true },
        { name: "lifecycle", ok: false, skipped: true },
        { name: "viewer-disconnect", ok: false, skipped: true }
      ]
    });
    expect(JSON.parse(formatMvpSessionSmokeJsonError(new Error("native-capture-unsupported")))).toEqual({
      ok: false,
      reason: "native-capture-unsupported",
      checks: [
        { name: "relay", ok: false },
        { name: "indicator", ok: false, skipped: true },
        { name: "frame", ok: false, skipped: true },
        { name: "surface", ok: false, skipped: true },
        { name: "signal", ok: false, skipped: true },
        { name: "surface-guards", ok: false, skipped: true },
        { name: "input", ok: false, skipped: true },
        { name: "audit", ok: false, skipped: true },
        { name: "lifecycle", ok: false, skipped: true },
        { name: "viewer-disconnect", ok: false, skipped: true }
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
    expect(plan.host.args).toContain("ws://localhost:18787/");
    expect(plan.host.args).toContain("approve");
    expect(plan.host.args).toContain("--visible-session");
    expect(plan.host.args).toContain("true");
    expect(plan.host.args).toContain("--host-signal-probe-ack");
    expect(plan.host.args).toContain("--revoke-after-ms");
    expect(plan.host.args).toContain("8000");
    expect(plan.host.args).toContain("--revoke-permission");
    expect(plan.host.args).toContain("input:pointer");
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

  it("builds explicit Windows capture smoke plans without static frame payloads or OS input", () => {
    const plan = createMvpSmokePlan({
      npmCommand: "npm",
      workDir: "C:\\Temp\\winbridge-smoke",
      relayPort: 18787,
      surfacePort: 35987,
      session: "smoke-test",
      windowsCapture: true
    });
    const serialized = JSON.stringify(plan);

    expect(plan.host.args).toContain("--dev-screen-frame-source");
    expect(plan.host.args).toContain("windows-capture");
    expect(plan.host.args).not.toContain("static");
    expect(plan.host.args).not.toContain("--dev-screen-frame-data-base64");
    expect(plan.host.args).toContain("--dev-screen-frame-count");
    expect(plan.host.args).toContain("3");
    expect(serialized).not.toContain("host-apply-input");
    expect(serialized).not.toContain("Start-Process");
    expect(serialized).not.toContain("playwright");
    expect(serialized).not.toContain("browser");
    expect(serialized).not.toContain("unattended");
    expect(serialized).not.toContain("service");
    expect(serialized).not.toContain("startup");
  });

  it("builds the default smoke viewer plan with an ephemeral local surface port", () => {
    const plan = createMvpSmokePlan({
      npmCommand: "npm",
      workDir: "C:\\Temp\\winbridge-smoke",
      relayPort: 18787,
      surfacePort: 0,
      session: "smoke-test"
    });

    expect(plan.viewer.args).toContain("--viewer-control-surface-port");
    expect(plan.viewer.args).toContain("0");
    expect(plan.surfaceUrl).toBeUndefined();
    expect(JSON.stringify(plan)).not.toContain("http://127.0.0.1:0/");
  });

  it("builds LAN-style smoke plans through a fixed loopback relay URL", () => {
    const plan = createMvpSmokePlan({
      npmCommand: "npm",
      workDir: "C:\\Temp\\winbridge-smoke",
      relayPort: 18787,
      surfacePort: 35987,
      session: "smoke-test",
      lanRelay: true
    });
    const serialized = JSON.stringify(plan);

    expect(plan.host.args).toContain("ws://127.0.0.1:18787/");
    expect(plan.viewer.args).toContain("ws://127.0.0.1:18787/");
    expect(serialized).not.toContain("windows-capture");
    expect(serialized).not.toContain("host-apply-input");
    expect(serialized).not.toContain("Start-Process");
    expect(serialized).not.toContain("WINBRIDGE_RELAY_BIND_HOST");
    expect(serialized).not.toContain("0.0.0.0");
  });

  it("builds token-protected smoke plans without changing local static safety boundaries", () => {
    const plan = createMvpSmokePlan({
      npmCommand: "npm",
      workDir: "C:\\Temp\\winbridge-smoke",
      relayPort: 18787,
      surfacePort: 35987,
      session: "smoke-test",
      sharedToken: "dev-shared-token"
    });
    const serialized = JSON.stringify(plan);

    expect(plan.relay.env).toEqual({
      WINBRIDGE_RELAY_PORT: "18787",
      WINBRIDGE_RELAY_SHARED_TOKEN: "dev-shared-token"
    });
    expect(plan.host.args).toEqual(expect.arrayContaining(["--token", "dev-shared-token"]));
    expect(plan.viewer.args).toEqual(expect.arrayContaining(["--token", "dev-shared-token"]));
    expect(plan.host.args).toContain("ws://localhost:18787/");
    expect(plan.viewer.args).toContain("ws://localhost:18787/");
    expect(serialized).not.toContain("windows-capture");
    expect(serialized).not.toContain("host-apply-input");
    expect(serialized).not.toContain("Start-Process");
    expect(serialized).not.toContain("playwright");
    expect(serialized).not.toContain("browser");
  });

  it("does not implicitly inherit relay shared tokens into smoke child processes", () => {
    const originalToken = process.env.WINBRIDGE_RELAY_SHARED_TOKEN;
    process.env.WINBRIDGE_RELAY_SHARED_TOKEN = "ambient-secret-token";
    try {
      expect(createSmokeProcessEnvironment()).not.toHaveProperty("WINBRIDGE_RELAY_SHARED_TOKEN");
      expect(
        createSmokeProcessEnvironment({
          WINBRIDGE_RELAY_PORT: "18787",
          WINBRIDGE_RELAY_SHARED_TOKEN: "explicit-plan-token"
        }).WINBRIDGE_RELAY_SHARED_TOKEN
      ).toBe("explicit-plan-token");
    } finally {
      if (originalToken === undefined) {
        delete process.env.WINBRIDGE_RELAY_SHARED_TOKEN;
      } else {
        process.env.WINBRIDGE_RELAY_SHARED_TOKEN = originalToken;
      }
    }
  });

  it("keeps token-protected LAN-style smoke on loopback without public relay bind", () => {
    const plan = createMvpSmokePlan({
      npmCommand: "npm",
      workDir: "C:\\Temp\\winbridge-smoke",
      relayPort: 18787,
      surfacePort: 35987,
      session: "smoke-test",
      lanRelay: true,
      sharedToken: "dev-shared-token"
    });
    const serialized = JSON.stringify(plan);

    expect(plan.host.args).toContain("ws://127.0.0.1:18787/");
    expect(plan.viewer.args).toContain("ws://127.0.0.1:18787/");
    expect(plan.relay.env.WINBRIDGE_RELAY_SHARED_TOKEN).toBe("dev-shared-token");
    expect(serialized).not.toContain("WINBRIDGE_RELAY_BIND_HOST");
    expect(serialized).not.toContain("0.0.0.0");
  });

  it("matches only active visible host indicator metadata", () => {
    expect(
      hasActiveVisibleHostIndicatorOutput(
        "[winbridge-agent] host indicator state=active authorizationStatus=approved authorizationId=authz_private visibleToHost=true permissionCount=3 cause=authorized\n"
      )
    ).toBe(true);
    expect(
      hasActiveVisibleHostIndicatorOutput(
        "[winbridge-agent] host indicator state=paused authorizationStatus=approved authorizationId=authz_private visibleToHost=true permissionCount=3 cause=paused\n"
      )
    ).toBe(false);
    expect(
      hasActiveVisibleHostIndicatorOutput(
        "[winbridge-agent] host indicator state=active authorizationStatus=approved authorizationId=authz_private visibleToHost=false permissionCount=3 cause=hidden\n"
      )
    ).toBe(false);
    expect(
      hasActiveVisibleHostIndicatorOutput(
        "[winbridge-agent] host indicator state=active authorizationStatus=approved authorizationId=authz_private visibleToHost=true permissionCount=0 cause=missing-permission\n"
      )
    ).toBe(false);
    expect(formatMvpSessionSmokeJsonError(new Error("indicator-not-ready"))).not.toContain(
      "authz_private"
    );
  });

  it("extracts only bounded safe viewer surface URLs from child output", () => {
    const readyLine =
      "[winbridge-agent] viewer local control surface url=http://127.0.0.1:49152/";

    expect(extractViewerSurfaceUrlFromOutput(readyLine)).toBe("http://127.0.0.1:49152/");
    expect(extractViewerSurfaceUrlFromOutput(`${readyLine}\n${readyLine}`)).toBe(
      "http://127.0.0.1:49152/"
    );

    for (const output of [
      "",
      "x".repeat(4097),
      "[winbridge-agent] viewer local control surface url=http://localhost:49152/",
      "[winbridge-agent] viewer local control surface url=http://127.0.0.1:0/",
      "[winbridge-agent] viewer local control surface url=http://127.0.0.1:80/",
      "[winbridge-agent] viewer local control surface url=http://127.0.0.1:49152/path",
      "[winbridge-agent] viewer local control surface url=http://127.0.0.1:49152/?token=raw-secret-token",
      "[winbridge-agent] viewer local control surface url=http://127.0.0.1:49152/#raw-secret-token",
      "[winbridge-agent] viewer local control surface url=http://user:pass@127.0.0.1:49152/",
      "[winbridge-agent] viewer local control surface url=https://127.0.0.1:49152/",
      `${readyLine}\n[winbridge-agent] viewer local control surface url=http://127.0.0.1:49153/`
    ]) {
      expect(extractViewerSurfaceUrlFromOutput(output)).toBeUndefined();
    }

    const failure = formatMvpSessionSmokeJsonError(
      new Error(
        "[winbridge-agent] viewer local control surface url=http://127.0.0.1:49152/?token=raw-secret-token"
      )
    );
    expect(failure).not.toContain("49152");
    expect(failure).not.toContain("raw-secret-token");
    expect(failure).not.toContain("127.0.0.1");
  });

  it("keeps the agent-shell CLI wired to bounded runtime logging for host indicator output", () => {
    const source = readFileSync(new URL("../apps/agent-shell/src/index.ts", import.meta.url), "utf8");
    const runtimeOptions = source.slice(
      source.indexOf("runtime = createAgentShellRuntime({"),
      source.indexOf("  const shutdown = async () => {")
    );

    expect(runtimeOptions).toContain("logger: console");
    expect(runtimeOptions).toContain("onEvent:");
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

  it("verifies local surface token origin and content-type guard denials", async () => {
    const calls: unknown[] = [];
    const guarded = await tryPostSurfaceGuardDenials(
      async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        if (url === "http://127.0.0.1:35987/status") {
          return {
            status: 403,
            json: async () => ({ ok: false, error: "rejected" })
          } as Response;
        }

        return {
          status: 403,
          json: async () => ({ ok: false, error: "rejected", token: "raw-secret-token" })
        } as Response;
      },
      "http://127.0.0.1:35987/",
      "safe-token"
    );

    expect(guarded).toBe(true);
    expect(calls).toEqual([
      {
        url: "http://127.0.0.1:35987/status",
        init: {
          cache: "no-store",
          headers: {
            host: "example.invalid:80"
          }
        }
      },
      {
        url: "http://127.0.0.1:35987/input",
        init: {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "http://127.0.0.1:35987"
          },
          body: JSON.stringify({ command: "pointer-move 0.5 0.5" })
        }
      },
      {
        url: "http://127.0.0.1:35987/input",
        init: {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "http://example.invalid",
            "x-winbridge-local-surface-token": "safe-token"
          },
          body: JSON.stringify({ command: "pointer-move 0.5 0.5" })
        }
      },
      {
        url: "http://127.0.0.1:35987/input",
        init: {
          method: "POST",
          headers: {
            "content-type": "text/plain",
            origin: "http://127.0.0.1:35987",
            "x-winbridge-local-surface-token": "safe-token"
          },
          body: JSON.stringify({ command: "pointer-move 0.5 0.5" })
        }
      }
    ]);
    expect(formatMvpSessionSmokeError(new Error("surface-guards-not-ready"))).toBe(
      "WinBridge MVP smoke check failed. reason=surface-guards-not-ready"
    );
    expect(formatMvpSessionSmokeJsonError(new Error("surface-guards-not-ready"))).not.toContain(
      "safe-token"
    );
    expect(formatMvpSessionSmokeJsonError(new Error("surface-guards-not-ready"))).not.toContain(
      "example.invalid"
    );
    expect(formatMvpSessionSmokeJsonError(new Error("surface-guards-not-ready"))).not.toContain(
      "raw-secret-token"
    );
  });

  it("verifies local surface mismatched Host rejection with bounded JSON", async () => {
    const calls: unknown[] = [];
    const rejected = await tryFetchSurfaceHostGuardRejection(
      async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return {
          status: 403,
          json: async () => ({ ok: false, error: "rejected" })
        } as Response;
      },
      "http://127.0.0.1:35987/"
    );

    expect(rejected).toBe(true);
    expect(calls).toEqual([
      {
        url: "http://127.0.0.1:35987/status",
        init: {
          cache: "no-store",
          headers: {
            host: "example.invalid:80"
          }
        }
      }
    ]);
    expect(formatMvpSessionSmokeJsonError(new Error("surface-guards-not-ready"))).not.toContain(
      "example.invalid"
    );
  });

  it("does not treat accepted malformed or failed Host guard probes as guarded", async () => {
    await expect(
      tryFetchSurfaceHostGuardRejection(
        async () =>
          ({
            status: 200,
            json: async () => ({ ok: true, state: {} })
          }) as Response,
        "http://127.0.0.1:35987/"
      )
    ).resolves.toBe(false);

    await expect(
      tryFetchSurfaceHostGuardRejection(
        async () =>
          ({
            status: 500,
            json: async () => ({ ok: false, error: "rejected" })
          }) as Response,
        "http://127.0.0.1:35987/"
      )
    ).resolves.toBe(false);

    await expect(
      tryFetchSurfaceHostGuardRejection(
        async () =>
          ({
            status: 403,
            json: async () => ({ ok: false, error: "rejected", host: "example.invalid" })
          }) as Response,
        "http://127.0.0.1:35987/"
      )
    ).resolves.toBe(false);

    await expect(
      tryFetchSurfaceHostGuardRejection(
        async () => {
          throw new Error("raw-secret-token network failure");
        },
        "http://127.0.0.1:35987/"
      )
    ).resolves.toBe(false);
  });

  it("does not treat accepted guard probes or network failures as guarded", async () => {
    await expect(
      tryPostSurfaceGuardDenials(
        async () =>
          ({
            status: 202,
            json: async () => ({ ok: true, action: "input", kind: "pointer-move" })
          }) as Response,
        "http://127.0.0.1:35987/",
        "safe-token"
      )
    ).resolves.toBe(false);

    await expect(
      tryPostSurfaceGuardDenials(
        async () => {
          throw new Error("raw-secret-token network failure");
        },
        "http://127.0.0.1:35987/",
        "safe-token"
      )
    ).resolves.toBe(false);
  });

  it("recognizes explicit lifecycle denial from the token-protected surface input path", async () => {
    const calls: unknown[] = [];
    const denied = await tryPostSurfaceInputDenied(
      async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return {
          status: 409,
          json: async () => ({ ok: false, error: "not-ready", messageBytes: 42 })
        } as Response;
      },
      "http://127.0.0.1:35987/",
      "safe-token"
    );

    expect(denied).toBe(true);
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
    expect(formatMvpSessionSmokeJsonError(new Error("lifecycle-not-ready"))).not.toContain(
      "pointer-move"
    );
    expect(formatMvpSessionSmokeJsonError(new Error("lifecycle-not-ready"))).not.toContain(
      "safe-token"
    );
  });

  it("does not treat accepted input or network failures as lifecycle denial", async () => {
    await expect(
      tryPostSurfaceInputDenied(
        async () =>
          ({
            status: 202,
            json: async () => ({ ok: true, action: "input", kind: "pointer-move" })
          }) as Response,
        "http://127.0.0.1:35987/",
        "safe-token"
      )
    ).resolves.toBe(false);

    await expect(
      tryPostSurfaceInputDenied(
        async () => {
          throw new Error("raw-token network failure");
        },
        "http://127.0.0.1:35987/",
        "safe-token"
      )
    ).resolves.toBe(false);
  });

  it("posts a bounded empty disconnect request through the token-protected surface path", async () => {
    const calls: unknown[] = [];
    const accepted = await tryPostSurfaceDisconnect(
      async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return {
          status: 202,
          json: async () => ({ ok: true, action: "disconnect" })
        } as Response;
      },
      "http://127.0.0.1:35987/",
      "safe-token"
    );

    expect(accepted).toBe(true);
    expect(calls).toEqual([
      {
        url: "http://127.0.0.1:35987/disconnect",
        init: {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "http://127.0.0.1:35987",
            "x-winbridge-local-surface-token": "safe-token"
          },
          body: JSON.stringify({})
        }
      }
    ]);
    expect(formatMvpSessionSmokeError(new Error("viewer-disconnect-not-ready"))).toBe(
      "WinBridge MVP smoke check failed. reason=viewer-disconnect-not-ready"
    );
    expect(formatMvpSessionSmokeJsonError(new Error("viewer-disconnect-not-ready"))).not.toContain(
      "safe-token"
    );
    expect(formatMvpSessionSmokeJsonError(new Error("viewer-disconnect-not-ready"))).not.toContain(
      "127.0.0.1:35987"
    );
  });

  it("does not treat unexpected disconnect responses or network failures as accepted", async () => {
    await expect(
      tryPostSurfaceDisconnect(
        async () =>
          ({
            status: 200,
            json: async () => ({ ok: true, action: "disconnect", token: "raw-secret-token" })
          }) as Response,
        "http://127.0.0.1:35987/",
        "safe-token"
      )
    ).resolves.toBe(false);

    await expect(
      tryPostSurfaceDisconnect(
        async () => {
          throw new Error("raw-secret-token network failure");
        },
        "http://127.0.0.1:35987/",
        "safe-token"
      )
    ).resolves.toBe(false);
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
              state: "active",
              visibleToHost: true,
              permissionCount: 3,
              authorizationStatus: "active",
              signalProbeAckReceived: true,
              inputPointerReady: true,
              inputKeyboardReady: true
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

  it("rejects incomplete or unsafe status readiness without exposing raw status data", async () => {
    const readyStatus = {
      ok: true,
      state: {
        state: "active",
        visibleToHost: true,
        permissionCount: 3,
        authorizationStatus: "active",
        signalProbeAckReceived: true,
        inputPointerReady: true,
        inputKeyboardReady: true
      }
    };
    const unsafeStatuses = [
      { ...readyStatus, authorizationId: "authz_private" },
      { ...readyStatus, state: { ...readyStatus.state, authorizationId: "authz_private" } },
      { ...readyStatus, state: { ...readyStatus.state, permissions: ["screen:view"] } },
      { ...readyStatus, state: { ...readyStatus.state, token: "raw-secret-token" } },
      { ...readyStatus, state: { ...readyStatus.state, pairingCode: "123-456" } },
      { ...readyStatus, state: { ...readyStatus.state, signalKind: "host-signal-probe-ack" } },
      { ...readyStatus, state: { ...readyStatus.state, rawSignalMarker: "viewer-signal-probe-raw" } },
      { ...readyStatus, state: { ...readyStatus.state, inputPointerReady: false } },
      { ...readyStatus, state: { ...readyStatus.state, inputKeyboardReady: false } },
      { ...readyStatus, state: { ...readyStatus.state, visibleToHost: false } },
      { ...readyStatus, state: { ...readyStatus.state, state: "inactive" } },
      { ...readyStatus, state: { ...readyStatus.state, signalProbeAckReceived: false } }
    ];

    for (const status of unsafeStatuses) {
      await expect(
        tryFetchSurfaceSignalReadiness(
          async () =>
            ({
              ok: true,
              json: async () => status
            }) as Response,
          "http://127.0.0.1:35987/"
        )
      ).resolves.toBe(false);
    }

    const failure = formatMvpSessionSmokeJsonError(new Error("signal-not-ready"));
    expect(failure).not.toContain("viewer-signal-probe-raw");
    expect(failure).not.toContain("authz_private");
    expect(failure).not.toContain("raw-secret-token");
    expect(failure).not.toContain("123-456");
  });

  it("accepts bounded schema-like smoke audit records without exposing raw contents", () => {
    const auditLine = smokeAuditLine("agent-shell.authorization.active");

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

  it("summarizes smoke audit logs with fixed safe metadata only", () => {
    const summary = summarizeSmokeAuditLogContent(
      [
        smokeAuditLine("agent-shell.authorization.approved", "accepted"),
        smokeAuditLine("agent-shell.authorization.active", "accepted"),
        smokeAuditLine("agent-shell.remote-interaction.screen-frame.sent", "accepted"),
        smokeAuditLine("agent-shell.remote-interaction.input-event.sent", "accepted"),
        smokeAuditLine("agent-shell.permission.revoked", "accepted")
      ].join("\n")
    );

    expect(summary).toEqual({
      records: 5,
      accepted: 5,
      denied: 0,
      failed: 0,
      authorizationApproved: true,
      authorizationActive: true,
      screenFrameSent: true,
      screenFrameOutput: false,
      inputSent: true,
      permissionRevoked: true
    });

    const output = formatMvpSessionSmokeJsonSuccess({
      ok: true,
      workDir: "C:\\Temp\\winbridge-mvp-smoke-safe",
      auditSummary: {
        host: summary,
        viewer: {
          records: 1,
          accepted: 1,
          denied: 0,
          failed: 0,
          authorizationApproved: false,
          authorizationActive: false,
          screenFrameSent: false,
          screenFrameOutput: true,
          inputSent: false,
          permissionRevoked: false
        }
      }
    });

    expect(JSON.parse(output)).toMatchObject({
      ok: true,
      auditSummary: {
        host: { records: 5, inputSent: true, permissionRevoked: true },
        viewer: { records: 1, screenFrameOutput: true }
      }
    });
    expect(output).not.toContain("agent-shell");
    expect(output).not.toContain("audit_safe123");
    expect(output).not.toContain("authz_safe");
    expect(output).not.toContain("host-smoke");

    const unsafeOutput = formatMvpSessionSmokeJsonSuccess({
      ok: true,
      workDir: "C:\\Temp\\winbridge-mvp-smoke-safe",
      auditSummary: {
        host: { records: "raw-secret-token" },
        action: "agent-shell.authorization.active"
      }
    });
    expect(unsafeOutput).not.toContain("auditSummary");
    expect(unsafeOutput).not.toContain("raw-secret-token");
    expect(unsafeOutput).not.toContain("agent-shell");
  });

  it("rejects malformed or oversized smoke audit content for summary parsing", () => {
    expect(
      summarizeSmokeAuditLogContent(`${smokeAuditLine("agent-shell.authorization.active")}\nnot-json`)
    ).toBeUndefined();
    expect(
      summarizeSmokeAuditLogContent(
        JSON.stringify({
          eventId: "audit_safe123",
          timestamp: "2026-06-22T08:00:00.000Z",
          actor: { type: "host", id: "host-smoke" },
          action: "agent-shell.authorization.active",
          outcome: "accepted",
          detail: { authorizationId: "authz_safe" }
        }) + "x".repeat(4096)
      )
    ).toBeUndefined();
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

  it("fails Windows capture smoke before startup on non-Windows platforms", async () => {
    const spawned: string[] = [];

    await expect(
      runMvpSessionSmokeCheck({
        cwd: "C:\\repo",
        workDir: "C:\\Temp\\native-capture-smoke",
        relayPort: 18787,
        surfacePort: 35987,
        timeoutMs: 1000,
        keepArtifacts: true,
        windowsCapture: true,
        platform: "linux",
        spawnProcess: (command: string, args: string[]) => {
          spawned.push([command, ...args].join(" "));
          return fakeChild(400 + spawned.length);
        }
      })
    ).rejects.toThrow("WinBridge MVP smoke check failed. reason=native-capture-unsupported");

    expect(spawned).toEqual([]);
    expect(formatMvpSessionSmokeError(new Error("native-capture-unsupported"))).toBe(
      "WinBridge MVP smoke check failed. reason=native-capture-unsupported"
    );
    expect(formatMvpSessionSmokeJsonError(new Error("native-capture-unsupported"))).not.toContain(
      "C:\\Temp\\native-capture-smoke"
    );
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

function smokeAuditLine(action: string, outcome = "accepted") {
  return JSON.stringify({
    eventId: "audit_safe123",
    timestamp: "2026-06-22T08:00:00.000Z",
    actor: { type: "host", id: "host-smoke" },
    action,
    outcome,
    detail: { authorizationId: "authz_safe" }
  });
}
