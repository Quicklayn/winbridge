import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_MVP_SMOKE_OPTIONS = Object.freeze({
  timeoutMs: 45_000,
  hostPeer: "host-smoke",
  viewerPeer: "viewer-smoke",
  pairing: "123-456",
  captureAfterMs: 250,
  captureCount: 3,
  captureIntervalMs: 250,
  lifecycleRevokeAfterMs: 8_000
});

export const MVP_SESSION_SMOKE_USAGE = [
  "Usage: npm run mvp:smoke -- [options]",
  "",
  "Options:",
  "  --timeout-ms 45000",
  "  --keep-artifacts",
  "  --lan-relay",
  "  --windows-capture",
  "  --windows-input",
  "  --token-env WINBRIDGE_RELAY_SHARED_TOKEN",
  "  --json",
  "",
  "The smoke check starts local relay, host, and viewer development processes",
  "with static frames by default. Use --windows-capture or --windows-input only",
  "on Windows to exercise the consent-bound host native adapters. By default it",
  "does not use relay shared tokens; with --token-env it references one bounded",
  "environment variable without printing the token value. It does not use OS",
  "input unless --windows-input is explicit, and it never uses browser",
  "automation, services, startup persistence, or unattended access."
].join("\n");

const SAFE_TIMER_DELAY_MS = 2_147_483_647;
const OUTPUT_LIMIT_BYTES = 4096;
const RELAY_SHARED_TOKEN_MAX_BYTES = 1024;
const ENV_NAME_PATTERN = /^[A-Z_][A-Z0-9_]{0,127}$/;
const SMOKE_AUDIT_LOG_CONTENT_LIMIT_BYTES = 256 * 1024;
const SMOKE_AUDIT_LOG_LINE_LIMIT_BYTES = 4096;
const MVP_SMOKE_CHECK_NAMES = Object.freeze([
  "relay",
  "indicator",
  "host-surface",
  "frame",
  "surface",
  "signal",
  "surface-guards",
  "input",
  "audit",
  "lifecycle",
  "viewer-disconnect"
]);
const MVP_WINDOWS_INPUT_SMOKE_CHECK_NAMES = Object.freeze([
  "relay",
  "indicator",
  "host-surface",
  "frame",
  "surface",
  "signal",
  "surface-guards",
  "input",
  "windows-input",
  "audit",
  "lifecycle",
  "viewer-disconnect"
]);
const SMOKE_AUDIT_SUMMARY_FLAGS = Object.freeze([
  "authorizationApproved",
  "authorizationActive",
  "screenFrameSent",
  "screenFrameOutput",
  "inputSent",
  "permissionRevoked",
  "disconnectObserved"
]);
const REQUIRED_SMOKE_AUDIT_EVIDENCE_BY_ROLE = Object.freeze({
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
const REQUIRED_SMOKE_AUDIT_EVIDENCE = Symbol("requiredSmokeAuditEvidence");
const REQUIRED_SMOKE_AUDIT_ACTIONS_BY_ROLE = Object.freeze({
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
const SMOKE_AUDIT_SUMMARY_ACTIONS = Object.freeze({
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
const SAFE_SURFACE_STATUS_TOP_LEVEL_KEYS = Object.freeze(["ok", "state"]);
const SAFE_SURFACE_STATUS_STATE_KEYS = Object.freeze([
  "state",
  "authorizationStatus",
  "expiresAt",
  "remoteDisconnectReasonCode",
  "localInactiveCause",
  "visibleToHost",
  "permissionCount",
  "inputPointerReady",
  "inputKeyboardReady",
  "signalProbeAckReceived"
]);
const SAFE_HOST_SURFACE_STATUS_TOP_LEVEL_KEYS = Object.freeze(["ok", "state"]);
const SAFE_HOST_SURFACE_STATUS_STATE_KEYS = Object.freeze([
  "state",
  "authorizationStatus",
  "expiresAt",
  "remoteDisconnectReasonCode",
  "inactiveCause",
  "visibleToHost",
  "permissionCount",
  "viewerDeviceId",
  "viewerDevicePlatform"
]);
const SMOKE_VIEWER_SURFACE_MISMATCHED_HOST = "example.invalid:80";
const SMOKE_HOST_SURFACE_MISMATCHED_HOST = "example.invalid:80";
const MVP_SMOKE_FAILURE_CHECK_INDEX = Object.freeze({
  "relay-not-ready": 0,
  "port-unavailable": 0,
  "native-capture-unsupported": 0,
  "native-input-unsupported": 0,
  "indicator-not-ready": 1,
  "host-surface-not-ready": 2,
  "frame-not-ready": 3,
  "surface-not-ready": 4,
  "signal-not-ready": 5,
  "surface-guards-not-ready": 6,
  "input-not-ready": 7,
  "windows-input-not-ready": 8,
  "audit-not-ready": 8,
  "lifecycle-not-ready": 9,
  "viewer-disconnect-not-ready": 10
});
const MVP_WINDOWS_INPUT_SMOKE_FAILURE_CHECK_INDEX = Object.freeze({
  ...MVP_SMOKE_FAILURE_CHECK_INDEX,
  "audit-not-ready": 9,
  "lifecycle-not-ready": 10,
  "viewer-disconnect-not-ready": 11
});
const WINDOWS_INPUT_APPLIED_AUDIT_ACTION = "agent-shell.remote-interaction.input-event.applied";

export class MvpSessionSmokeUsageError extends Error {
  constructor() {
    super(MVP_SESSION_SMOKE_USAGE);
    this.name = "MvpSessionSmokeUsageError";
  }
}

export class MvpSessionSmokeError extends Error {
  constructor(message) {
    super(message);
    this.name = "MvpSessionSmokeError";
  }
}

export function parseMvpSessionSmokeArgs(rawArgs) {
  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }

  if (rawArgs.includes("--help")) {
    throw new MvpSessionSmokeUsageError();
  }

  let timeoutMs = DEFAULT_MVP_SMOKE_OPTIONS.timeoutMs;
  let keepArtifacts = false;
  let json = false;
  let lanRelay = false;
  let windowsCapture = false;
  let windowsInput = false;
  let tokenEnv;
  let sawTimeout = false;
  let sawTokenEnv = false;

  for (let index = 0; index < rawArgs.length;) {
    const key = rawArgs[index];

    if (key === "--json") {
      if (json) {
        throw new MvpSessionSmokeUsageError();
      }
      json = true;
      index += 1;
      continue;
    }

    if (key === "--lan-relay") {
      if (lanRelay) {
        throw new MvpSessionSmokeUsageError();
      }
      lanRelay = true;
      index += 1;
      continue;
    }

    if (key === "--windows-capture") {
      if (windowsCapture) {
        throw new MvpSessionSmokeUsageError();
      }
      windowsCapture = true;
      index += 1;
      continue;
    }

    if (key === "--windows-input") {
      if (windowsInput) {
        throw new MvpSessionSmokeUsageError();
      }
      windowsInput = true;
      index += 1;
      continue;
    }

    if (key === "--keep-artifacts") {
      if (keepArtifacts) {
        throw new MvpSessionSmokeUsageError();
      }
      keepArtifacts = true;
      index += 1;
      continue;
    }

    if (key === "--timeout-ms") {
      if (sawTimeout) {
        throw new MvpSessionSmokeUsageError();
      }
      const value = rawArgs[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new MvpSessionSmokeUsageError();
      }
      timeoutMs = parseIntegerOption(value, 1_000, SAFE_TIMER_DELAY_MS);
      sawTimeout = true;
      index += 2;
      continue;
    }

    if (key === "--token-env") {
      if (sawTokenEnv) {
        throw new MvpSessionSmokeUsageError();
      }
      const value = rawArgs[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new MvpSessionSmokeUsageError();
      }
      tokenEnv = parseSmokeTokenEnvName(value);
      sawTokenEnv = true;
      index += 2;
      continue;
    }

    if (!key?.startsWith("--")) {
      throw new MvpSessionSmokeUsageError();
    }
    throw new MvpSessionSmokeUsageError();
  }

  return {
    help: false,
    timeoutMs,
    keepArtifacts,
    lanRelay,
    windowsCapture,
    windowsInput,
    ...(tokenEnv ? { tokenEnv } : {}),
    json
  };
}

export function createMvpSmokePlan(options) {
  const npmInvocation = options.npmCommand
    ? { command: options.npmCommand, argsPrefix: [] }
    : defaultNpmInvocation();
  const session = options.session ?? `smoke-${Date.now()}`;
  const relayHost = options.lanRelay ? "127.0.0.1" : "localhost";
  const relayUrl = `ws://${relayHost}:${options.relayPort}/`;
  const framePath = join(options.workDir, "frames", "latest.png");
  const hostAuditPath = join(options.workDir, "logs", "host-audit.jsonl");
  const viewerAuditPath = join(options.workDir, "logs", "viewer-audit.jsonl");
  const sharedToken = parseOptionalSmokeSharedToken(options.sharedToken);
  const tokenArgs = sharedToken ? ["--token-env", "WINBRIDGE_RELAY_SHARED_TOKEN"] : [];
  const agentTokenEnv = sharedToken ? { WINBRIDGE_RELAY_SHARED_TOKEN: sharedToken } : {};
  const frameSource = options.windowsCapture ? "windows-capture" : "static";

  return {
    session,
    framePath,
    hostAuditPath,
    viewerAuditPath,
    relay: {
      label: "relay",
      command: npmInvocation.command,
      args: [...npmInvocation.argsPrefix, "--workspace", "@winbridge/relay", "run", "dev"],
      env: {
        WINBRIDGE_RELAY_PORT: String(options.relayPort),
        ...(sharedToken ? { WINBRIDGE_RELAY_SHARED_TOKEN: sharedToken } : {})
      }
    },
    host: {
      label: "host",
      command: npmInvocation.command,
      args: [
        ...npmInvocation.argsPrefix,
        "--workspace",
        "@winbridge/agent-shell",
        "run",
        "dev",
        "--",
        "host",
        "--relay",
        relayUrl,
        "--session",
        session,
        "--pairing",
        DEFAULT_MVP_SMOKE_OPTIONS.pairing,
        "--peer",
        DEFAULT_MVP_SMOKE_OPTIONS.hostPeer,
        "--host-decision",
        "approve",
        "--visible-session",
        "true",
        "--host-signal-probe-ack",
        "true",
        "--host-control-surface-port",
        "0",
        ...(options.windowsInput ? ["--host-apply-input", "true"] : []),
        "--revoke-after-ms",
        String(DEFAULT_MVP_SMOKE_OPTIONS.lifecycleRevokeAfterMs),
        "--revoke-permission",
        "input:pointer",
        "--audit-log",
        hostAuditPath,
        "--dev-screen-frame-after-ms",
        String(DEFAULT_MVP_SMOKE_OPTIONS.captureAfterMs),
        "--dev-screen-frame-source",
        frameSource,
        "--dev-screen-frame-count",
        String(DEFAULT_MVP_SMOKE_OPTIONS.captureCount),
        "--dev-screen-frame-interval-ms",
        String(DEFAULT_MVP_SMOKE_OPTIONS.captureIntervalMs),
        ...tokenArgs
      ],
      env: agentTokenEnv
    },
    viewer: {
      label: "viewer",
      command: npmInvocation.command,
      args: [
        ...npmInvocation.argsPrefix,
        "--workspace",
        "@winbridge/agent-shell",
        "run",
        "dev",
        "--",
        "viewer",
        "--relay",
        relayUrl,
        "--session",
        session,
        "--pairing",
        DEFAULT_MVP_SMOKE_OPTIONS.pairing,
        "--peer",
        DEFAULT_MVP_SMOKE_OPTIONS.viewerPeer,
        "--request",
        "screen:view,input:pointer,input:keyboard",
        "--viewer-signal-probe-after-ms",
        "0",
        "--audit-log",
        viewerAuditPath,
        "--viewer-screen-frame-output",
        framePath,
        "--viewer-control-surface-port",
        String(options.surfacePort),
        ...tokenArgs
      ],
      env: agentTokenEnv
    },
    surfaceUrl:
      options.surfacePort === 0 ? undefined : `http://127.0.0.1:${options.surfacePort}/`
  };
}

export async function runMvpSessionSmokeCheck(rawOptions = {}) {
  const options = {
    timeoutMs: rawOptions.timeoutMs ?? DEFAULT_MVP_SMOKE_OPTIONS.timeoutMs,
    cwd: rawOptions.cwd ?? process.cwd(),
    spawnProcess: rawOptions.spawnProcess ?? spawn,
    killProcessTree: rawOptions.killProcessTree ?? killProcessTree,
    fetchImpl: rawOptions.fetchImpl ?? fetch,
    now: rawOptions.now ?? (() => Date.now()),
    sleep: rawOptions.sleep ?? sleep,
    signalTarget: rawOptions.signalTarget ?? process
  };
  if (rawOptions.windowsCapture && (rawOptions.platform ?? process.platform) !== "win32") {
    throw new MvpSessionSmokeError(
      formatMvpSessionSmokeError(new Error("native-capture-unsupported"))
    );
  }
  if (rawOptions.windowsInput && (rawOptions.platform ?? process.platform) !== "win32") {
    throw new MvpSessionSmokeError(
      formatMvpSessionSmokeError(new Error("native-input-unsupported"))
    );
  }
  const deadline = options.now() + options.timeoutMs;
  const workDir = rawOptions.workDir ?? mkdtempSync(join(tmpdir(), "winbridge-mvp-smoke-"));
  const relayPort = rawOptions.relayPort ?? 0;
  const surfacePort = rawOptions.surfacePort ?? 0;
  const sharedToken = parseOptionalSmokeSharedToken(rawOptions.sharedToken);
  const plan = createMvpSmokePlan({ ...rawOptions, workDir, relayPort, surfacePort, sharedToken });
  const children = [];
  let cleanupPromise;
  const cleanupOnce = () => {
    cleanupPromise ??= stopSmokeProcesses(children, options.killProcessTree);
    return cleanupPromise;
  };
  const { interruptPromise, removeSignalHandlers } = installSmokeSignalHandlers(
    options.signalTarget,
    cleanupOnce
  );

  try {
    return await Promise.race([
      runMvpSessionSmokeSteps({ plan, rawOptions, workDir, relayPort, surfacePort, deadline, children, options }),
      interruptPromise
    ]);
  } catch (error) {
    throw new MvpSessionSmokeError(formatMvpSessionSmokeError(error));
  } finally {
    removeSignalHandlers();
    await cleanupOnce();
    if (!rawOptions.keepArtifacts) {
      rmSync(workDir, { recursive: true, force: true });
    }
  }
}

async function runMvpSessionSmokeSteps(context) {
  const { plan, rawOptions, workDir, relayPort, surfacePort, deadline, children, options } = context;
  const relay = startSmokeProcess(plan.relay, options);
  children.push(relay);
  const resolvedRelayPort =
    relayPort === 0 ? await waitForRelayPort(relay, deadline, options) : relayPort;
  const readyPlan =
    resolvedRelayPort === relayPort
      ? plan
      : createMvpSmokePlan({
          ...rawOptions,
          workDir,
          relayPort: resolvedRelayPort,
          surfacePort,
          sharedToken: rawOptions.sharedToken,
          windowsCapture: rawOptions.windowsCapture,
          windowsInput: rawOptions.windowsInput
        });

  const host = startSmokeProcess(readyPlan.host, options);
  children.push(host);
  await waitForHostPairingTicket(relay, deadline, options);
  const viewer = startSmokeProcess(readyPlan.viewer, options);
  children.push(viewer);

  await waitForHostActiveVisibleIndicator(host, deadline, options);
  const hostSurfaceUrl = await waitForHostSurfaceUrl(host, deadline, options);
  const hostSurface = await waitForHostSurface(hostSurfaceUrl, deadline, options);
  await waitForHostSurfaceGuards(hostSurfaceUrl, hostSurface.mutationToken, deadline, options);
  await waitForFrameFile(readyPlan.framePath, deadline, options);
  const surfaceUrl = readyPlan.surfaceUrl ?? (await waitForViewerSurfaceUrl(viewer, deadline, options));
  const surface = await waitForViewerSurface(surfaceUrl, deadline, options);
  await waitForViewerSignalReadiness(surfaceUrl, deadline, options);
  await waitForViewerSurfaceGuards(surfaceUrl, surface.mutationToken, deadline, options);
  await waitForViewerSurfaceInput(surfaceUrl, surface.mutationToken, deadline, options);
  if (rawOptions.windowsInput) {
    await waitForWindowsInputAudit(readyPlan.hostAuditPath, deadline, options);
  }
  await waitForSmokeAuditLogs(
    [readyPlan.hostAuditPath, readyPlan.viewerAuditPath],
    deadline,
    options
  );
  await waitForViewerSurfaceInputDenied(surfaceUrl, surface.mutationToken, deadline, options);
  await waitForViewerSurfaceDisconnect(surfaceUrl, surface.mutationToken, deadline, options);
  const auditSummary = await waitForSmokeAuditSummary(
    readyPlan.hostAuditPath,
    readyPlan.viewerAuditPath,
    deadline,
    options
  );

  return {
    ok: true,
    workDir,
    framePath: readyPlan.framePath,
    surfaceUrl,
    auditSummary
  };
}

export function startSmokeProcess(plan, options = {}) {
  const spawnProcess = options.spawnProcess ?? spawn;
  let child;
  try {
    child = spawnProcess(plan.command, plan.args, {
      cwd: options.cwd ?? process.cwd(),
      env: createSmokeProcessEnvironment(plan.env),
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: false
    });
  } catch {
    throw new Error(`${plan.label}-spawn-failed`);
  }
  const handle = {
    label: plan.label,
    child,
    output: "",
    exited: false,
    exitCode: undefined
  };

  const appendOutput = (chunk) => {
    handle.output = `${handle.output}${String(chunk)}`.slice(-OUTPUT_LIMIT_BYTES);
  };

  child.stdout?.on("data", appendOutput);
  child.stderr?.on("data", appendOutput);
  child.on?.("exit", (code) => {
    handle.exited = true;
    handle.exitCode = code ?? 0;
  });
  child.on?.("error", (error) => {
    handle.exited = true;
    handle.exitCode = 1;
    appendOutput(error.message);
  });

  return handle;
}

export function createSmokeProcessEnvironment(planEnv = {}) {
  const env = { ...process.env };
  delete env.WINBRIDGE_RELAY_SHARED_TOKEN;
  return { ...env, ...planEnv };
}

export async function stopSmokeProcesses(handles, killProcessTreeImpl = killProcessTree) {
  for (const handle of [...handles].reverse()) {
    if (handle?.child?.pid && !handle.exited) {
      await killProcessTreeImpl(handle.child.pid);
    }
  }
}

export function installSmokeSignalHandlers(signalTarget, cleanupOnce) {
  let interrupted = false;
  let rejectInterrupt;
  const interruptPromise = new Promise((_, reject) => {
    rejectInterrupt = reject;
  });
  const onSignal = (signal) => {
    if (interrupted) {
      return;
    }
    interrupted = true;
    void cleanupOnce().finally(() => {
      rejectInterrupt(new Error(`smoke-interrupted-${signal}`));
    });
  };

  signalTarget.on?.("SIGINT", onSignal);
  signalTarget.on?.("SIGTERM", onSignal);

  return {
    interruptPromise,
    removeSignalHandlers: () => {
      signalTarget.off?.("SIGINT", onSignal);
      signalTarget.off?.("SIGTERM", onSignal);
    }
  };
}

export function formatMvpSessionSmokeError(error) {
  if (error instanceof MvpSessionSmokeUsageError) {
    return MVP_SESSION_SMOKE_USAGE;
  }

  if (error instanceof MvpSessionSmokeError) {
    return error.message;
  }

  const reason = safeSmokeFailureReason(error);
  return reason
    ? `WinBridge MVP smoke check failed. reason=${reason}`
    : "WinBridge MVP smoke check failed.";
}

export function formatMvpSessionSmokeSuccess(result, options = {}) {
  return [
    "WinBridge MVP smoke check passed.",
    "indicator=verified",
    "host-surface=verified",
    "surface=verified",
    "frame=verified",
    "signal=verified",
    "surface-guards=verified",
    "input=verified",
    ...(options.windowsInput ? ["windows-input=verified"] : []),
    "audit=verified",
    "lifecycle=verified",
    "viewer-disconnect=verified",
    ...formatSmokeAuditSummaryLines(result.auditSummary),
    options.keepArtifacts && !options.windowsInput
      ? `artifacts=${result.workDir}`
      : `artifacts=${artifactStatusForOptions(options)}`
  ].join("\n");
}

export function formatMvpSessionSmokeJsonSuccess(result, options = {}) {
  const auditSummary = sanitizeSmokeAuditSummary(result.auditSummary);
  return JSON.stringify({
    ok: true,
    checks: smokeCheckNamesForOptions(options).map((name) => ({ name, ok: true })),
    artifacts: artifactStatusForOptions(options),
    ...(auditSummary ? { auditSummary } : {}),
    ...(options.keepArtifacts && !options.windowsInput ? { artifactDir: result.workDir } : {})
  });
}

function artifactStatusForOptions(options = {}) {
  return options.keepArtifacts ? "retained" : "cleaned";
}

export function formatMvpSessionSmokeJsonError(error, options = {}) {
  const reason = safeSmokeJsonFailureReason(error);
  const checks = smokeFailureChecksForReason(reason, options);
  return JSON.stringify({
    ok: false,
    ...(reason ? { reason } : {}),
    ...(checks ? { checks } : {})
  });
}

function smokeFailureChecksForReason(reason, options = {}) {
  if (!reason || !Object.hasOwn(MVP_SMOKE_FAILURE_CHECK_INDEX, reason)) {
    return undefined;
  }
  if (reason === "windows-input-not-ready" && !options.windowsInput) {
    return undefined;
  }

  const failureIndexes = options.windowsInput
    ? MVP_WINDOWS_INPUT_SMOKE_FAILURE_CHECK_INDEX
    : MVP_SMOKE_FAILURE_CHECK_INDEX;
  const failedIndex = failureIndexes[reason];
  if (!Number.isInteger(failedIndex)) {
    return undefined;
  }
  return smokeCheckNamesForOptions(options).map((name, index) => {
    if (index < failedIndex) {
      return { name, ok: true };
    }
    if (index === failedIndex) {
      return { name, ok: false };
    }
    return { name, ok: false, skipped: true };
  });
}

function smokeCheckNamesForOptions(options = {}) {
  return options.windowsInput ? MVP_WINDOWS_INPUT_SMOKE_CHECK_NAMES : MVP_SMOKE_CHECK_NAMES;
}

function safeSmokeJsonFailureReason(error) {
  if (error instanceof MvpSessionSmokeUsageError) {
    return "usage";
  }

  const reason = safeSmokeFailureReason(error);
  if (reason) {
    return reason;
  }

  if (error instanceof MvpSessionSmokeError) {
    const match = error.message.match(/^WinBridge MVP smoke check failed\. reason=([a-z-]+)$/);
    return match?.[1];
  }

  return undefined;
}

function safeSmokeFailureReason(error) {
  if (!(error instanceof Error)) {
    return undefined;
  }
  if (/^(relay|host|viewer)-(exited|spawn-failed)$/.test(error.message)) {
    return error.message;
  }
  if (
    [
      "relay-not-ready",
      "host-not-ready",
      "native-capture-unsupported",
      "native-input-unsupported",
      "indicator-not-ready",
      "host-surface-not-ready",
      "frame-not-ready",
      "surface-not-ready",
      "signal-not-ready",
      "surface-guards-not-ready",
      "input-not-ready",
      "windows-input-not-ready",
      "audit-not-ready",
      "lifecycle-not-ready",
      "viewer-disconnect-not-ready",
      "port-unavailable"
    ].includes(error.message)
  ) {
    return error.message;
  }
  if (/^smoke-interrupted-(SIGINT|SIGTERM)$/.test(error.message)) {
    return "interrupted";
  }
  return undefined;
}

async function waitForRelayPort(handle, deadline, options) {
  const pattern = /\[winbridge-relay\] Listening on ws:\/\/127\.0\.0\.1:(\d+)/;
  while (options.now() <= deadline) {
    assertChildRunning(handle);
    const match = handle.output.match(pattern);
    if (match) {
      return Number.parseInt(match[1], 10);
    }
    await options.sleep(100);
  }
  throw new Error("relay-not-ready");
}

async function waitForHostPairingTicket(relayHandle, deadline, options) {
  while (options.now() <= deadline) {
    assertChildRunning(relayHandle);
    if (
      relayHandle.output.includes("relay.peer.join.accepted") &&
      relayHandle.output.includes(DEFAULT_MVP_SMOKE_OPTIONS.hostPeer) &&
      relayHandle.output.includes("pairingTicketCreated")
    ) {
      return;
    }
    await options.sleep(100);
  }
  throw new Error("host-not-ready");
}

async function waitForHostActiveVisibleIndicator(hostHandle, deadline, options) {
  while (options.now() <= deadline) {
    assertChildRunning(hostHandle);
    if (hasActiveVisibleHostIndicatorOutput(hostHandle.output)) {
      return;
    }
    await options.sleep(100);
  }
  throw new Error("indicator-not-ready");
}

async function waitForHostSurfaceUrl(hostHandle, deadline, options) {
  while (options.now() <= deadline) {
    assertChildRunning(hostHandle);
    const surfaceUrl = extractHostSurfaceUrlFromOutput(hostHandle.output);
    if (surfaceUrl !== undefined) {
      return surfaceUrl;
    }
    await options.sleep(100);
  }
  throw new Error("host-surface-not-ready");
}

export function extractHostSurfaceUrlFromOutput(output) {
  return extractSafeLoopbackSurfaceUrlFromOutput(
    output,
    /\[winbridge-agent\] host local control surface url=(http:\/\/[^\s]+)/g
  );
}

async function waitForViewerSurfaceUrl(viewerHandle, deadline, options) {
  while (options.now() <= deadline) {
    assertChildRunning(viewerHandle);
    const surfaceUrl = extractViewerSurfaceUrlFromOutput(viewerHandle.output);
    if (surfaceUrl !== undefined) {
      return surfaceUrl;
    }
    await options.sleep(100);
  }
  throw new Error("surface-not-ready");
}

export function extractViewerSurfaceUrlFromOutput(output) {
  return extractSafeLoopbackSurfaceUrlFromOutput(
    output,
    /\[winbridge-agent\] viewer local control surface url=(http:\/\/[^\s]+)/g
  );
}

function extractSafeLoopbackSurfaceUrlFromOutput(output, pattern) {
  if (typeof output !== "string" || output.length === 0 || output.length > OUTPUT_LIMIT_BYTES) {
    return undefined;
  }

  const matches = [...output.matchAll(pattern)];
  if (matches.length === 0) {
    return undefined;
  }

  const urls = matches.map((match) => parseSafeLoopbackSurfaceUrl(match[1]));
  if (urls.some((url) => url === undefined)) {
    return undefined;
  }

  const uniqueUrls = new Set(urls);
  return uniqueUrls.size === 1 ? urls[0] : undefined;
}

function parseSafeLoopbackSurfaceUrl(value) {
  try {
    const url = new URL(value);
    const port = Number.parseInt(url.port, 10);
    if (
      url.protocol !== "http:" ||
      url.hostname !== "127.0.0.1" ||
      url.username !== "" ||
      url.password !== "" ||
      url.pathname !== "/" ||
      url.search !== "" ||
      url.hash !== "" ||
      !Number.isInteger(port) ||
      port < 1024 ||
      port > 65535
    ) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
}

export function hasActiveVisibleHostIndicatorOutput(output) {
  if (typeof output !== "string" || output.length === 0 || output.length > OUTPUT_LIMIT_BYTES) {
    return false;
  }

  return output
    .split(/\r?\n/)
    .some(
      (line) =>
        line.includes("[winbridge-agent] host indicator") &&
        line.includes("state=active") &&
        line.includes("visibleToHost=true") &&
        /\bpermissionCount=([1-9]\d*)\b/.test(line)
    );
}

async function waitForHostSurface(surfaceUrl, deadline, options) {
  while (options.now() <= deadline) {
    const surface = await tryFetchHostSurfaceReadiness(options.fetchImpl, surfaceUrl);
    if (surface !== undefined) {
      return surface;
    }
    await options.sleep(100);
  }
  throw new Error("host-surface-not-ready");
}

export async function tryFetchHostSurfaceReadiness(fetchImpl, surfaceUrl) {
  const html = await tryFetchText(fetchImpl, surfaceUrl);
  const mutationToken = html === undefined ? undefined : extractViewerSurfaceMutationToken(html);
  if (!html?.includes("WinBridge Host") || mutationToken === undefined) {
    return undefined;
  }

  const ready = await tryFetchHostSurfaceStatusReadiness(fetchImpl, surfaceUrl);
  return ready ? { mutationToken } : undefined;
}

export async function tryFetchHostSurfaceStatusReadiness(fetchImpl, surfaceUrl) {
  try {
    const response = await fetchImpl(`${surfaceUrl}status`, { cache: "no-store" });
    if (!response.ok) {
      return false;
    }

    const body = await response.json();
    return isBoundedHostSurfaceStatusReady(body);
  } catch {
    return false;
  }
}

function isBoundedHostSurfaceStatusReady(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }

  const keys = Object.keys(body);
  if (
    !keys.includes("ok") ||
    !keys.includes("state") ||
    !keys.every((key) => SAFE_HOST_SURFACE_STATUS_TOP_LEVEL_KEYS.includes(key))
  ) {
    return false;
  }

  const state = body.state;
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return false;
  }

  const stateKeys = Object.keys(state);
  if (!stateKeys.every((key) => SAFE_HOST_SURFACE_STATUS_STATE_KEYS.includes(key))) {
    return false;
  }

  return (
    body.ok === true &&
    state.state === "active" &&
    state.visibleToHost === true &&
    Number.isInteger(state.permissionCount) &&
    state.permissionCount > 0
  );
}

async function waitForFrameFile(framePath, deadline, options) {
  while (options.now() <= deadline) {
    try {
      if (statSync(framePath).size > 0) {
        return;
      }
    } catch {
      // Keep polling until the bounded deadline.
    }
    await options.sleep(100);
  }
  throw new Error("frame-not-ready");
}

async function waitForViewerSurface(surfaceUrl, deadline, options) {
  while (options.now() <= deadline) {
    const html = await tryFetchText(options.fetchImpl, surfaceUrl);
    const frame = await tryFetchFrame(options.fetchImpl, `${surfaceUrl}frame`);
    const mutationToken = html === undefined ? undefined : extractViewerSurfaceMutationToken(html);
    if (html?.includes("WinBridge Viewer") && frame && mutationToken !== undefined) {
      return { mutationToken };
    }
    await options.sleep(100);
  }
  throw new Error("surface-not-ready");
}

export function extractViewerSurfaceMutationToken(html) {
  if (typeof html !== "string") {
    return undefined;
  }

  const match = html.match(/\bconst mutationToken = "([A-Za-z0-9_-]{16,256})";/);
  return match?.[1];
}

async function waitForViewerSignalReadiness(surfaceUrl, deadline, options) {
  while (options.now() <= deadline) {
    const ready = await tryFetchSurfaceSignalReadiness(options.fetchImpl, surfaceUrl);
    if (ready) {
      return;
    }
    await options.sleep(100);
  }
  throw new Error("signal-not-ready");
}

export async function tryFetchSurfaceSignalReadiness(fetchImpl, surfaceUrl) {
  try {
    const response = await fetchImpl(`${surfaceUrl}status`, { cache: "no-store" });
    if (!response.ok) {
      return false;
    }

    const body = await response.json();
    return isBoundedSurfaceStatusReady(body);
  } catch {
    return false;
  }
}

function isBoundedSurfaceStatusReady(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }

  const keys = Object.keys(body);
  if (
    !keys.includes("ok") ||
    !keys.includes("state") ||
    !keys.every((key) => SAFE_SURFACE_STATUS_TOP_LEVEL_KEYS.includes(key))
  ) {
    return false;
  }

  const state = body.state;
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return false;
  }

  const stateKeys = Object.keys(state);
  if (!stateKeys.every((key) => SAFE_SURFACE_STATUS_STATE_KEYS.includes(key))) {
    return false;
  }

  return (
    body.ok === true &&
    state.state === "active" &&
    state.visibleToHost === true &&
    Number.isInteger(state.permissionCount) &&
    state.permissionCount > 0 &&
    state.signalProbeAckReceived === true &&
    state.inputPointerReady === true &&
    state.inputKeyboardReady === true
  );
}

async function waitForViewerSurfaceGuards(surfaceUrl, mutationToken, deadline, options) {
  while (options.now() <= deadline) {
    const guarded = await tryPostSurfaceGuardDenials(options.fetchImpl, surfaceUrl, mutationToken);
    if (guarded) {
      return;
    }
    await options.sleep(100);
  }
  throw new Error("surface-guards-not-ready");
}

export async function tryPostSurfaceGuardDenials(fetchImpl, surfaceUrl, mutationToken) {
  const localOrigin = surfaceUrl.replace(/\/$/, "");
  const guarded = await Promise.all([
    tryFetchSurfaceHostGuardRejection(fetchImpl, surfaceUrl),
    tryPostSurfaceGuardProbe(fetchImpl, surfaceUrl, {
      "content-type": "application/json",
      origin: localOrigin
    }),
    tryPostSurfaceGuardProbe(fetchImpl, surfaceUrl, {
      "content-type": "application/json",
      origin: "http://example.invalid",
      "x-winbridge-local-surface-token": mutationToken
    }),
    tryPostSurfaceGuardProbe(fetchImpl, surfaceUrl, {
      "content-type": "text/plain",
      origin: localOrigin,
      "x-winbridge-local-surface-token": mutationToken
    })
  ]);
  return guarded.every(Boolean);
}

async function waitForHostSurfaceGuards(surfaceUrl, mutationToken, deadline, options) {
  while (options.now() <= deadline) {
    const guarded = await tryPostHostSurfaceGuardDenials(options.fetchImpl, surfaceUrl, mutationToken);
    if (guarded) {
      return;
    }
    await options.sleep(100);
  }
  throw new Error("host-surface-not-ready");
}

export async function tryPostHostSurfaceGuardDenials(fetchImpl, surfaceUrl, mutationToken) {
  const localOrigin = surfaceUrl.replace(/\/$/, "");
  const guarded = await Promise.all([
    tryPostHostSurfaceGuardProbe(fetchImpl, surfaceUrl, {
      "content-type": "application/json",
      host: SMOKE_HOST_SURFACE_MISMATCHED_HOST,
      origin: localOrigin,
      "x-winbridge-local-surface-token": mutationToken
    }),
    tryPostHostSurfaceGuardProbe(fetchImpl, surfaceUrl, {
      "content-type": "application/json",
      origin: localOrigin
    }),
    tryPostHostSurfaceGuardProbe(fetchImpl, surfaceUrl, {
      "content-type": "application/json",
      origin: "http://example.invalid",
      "x-winbridge-local-surface-token": mutationToken
    }),
    tryPostHostSurfaceGuardProbe(fetchImpl, surfaceUrl, {
      "content-type": "text/plain",
      origin: localOrigin,
      "x-winbridge-local-surface-token": mutationToken
    })
  ]);
  return guarded.every(Boolean);
}

async function tryPostHostSurfaceGuardProbe(fetchImpl, surfaceUrl, headers) {
  try {
    const response = await fetchImpl(`${surfaceUrl}control`, {
      method: "POST",
      headers,
      body: JSON.stringify({ command: "pause" })
    });
    if (response.status < 400 || response.status >= 500) {
      return false;
    }
    const body = await response.json();
    return hasExactRejectedSurfaceGuardShape(body);
  } catch {
    return false;
  }
}

export async function tryFetchSurfaceHostGuardRejection(fetchImpl, surfaceUrl) {
  try {
    const response = await fetchImpl(`${surfaceUrl}status`, {
      cache: "no-store",
      headers: {
        host: SMOKE_VIEWER_SURFACE_MISMATCHED_HOST
      }
    });
    if (response.status < 400 || response.status >= 500) {
      return false;
    }

    const body = await response.json();
    return hasExactRejectedSurfaceGuardShape(body);
  } catch {
    return false;
  }
}

async function tryPostSurfaceGuardProbe(fetchImpl, surfaceUrl, headers) {
  try {
    const response = await fetchImpl(`${surfaceUrl}input`, {
      method: "POST",
      headers,
      body: JSON.stringify({ command: "pointer-move 0.5 0.5" })
    });
    if (response.status < 400 || response.status >= 500) {
      return false;
    }
    const body = await response.json();
    return body?.ok === false && body.error === "rejected";
  } catch {
    return false;
  }
}

function hasExactRejectedSurfaceGuardShape(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }

  const keys = Object.keys(body);
  return keys.length === 2 && body.ok === false && body.error === "rejected";
}

async function waitForViewerSurfaceInput(surfaceUrl, mutationToken, deadline, options) {
  while (options.now() <= deadline) {
    const accepted =
      (await tryPostSurfaceInput(options.fetchImpl, surfaceUrl, mutationToken)) &&
      (await tryPostSurfaceKeyboardInput(options.fetchImpl, surfaceUrl, mutationToken));
    if (accepted) {
      return;
    }
    await options.sleep(100);
  }
  throw new Error("input-not-ready");
}

export async function tryPostSurfaceInput(fetchImpl, surfaceUrl, mutationToken) {
  return tryPostSurfaceInputCommand(
    fetchImpl,
    surfaceUrl,
    mutationToken,
    "pointer-move 0.5 0.5",
    "pointer-move"
  );
}

export async function tryPostSurfaceKeyboardInput(fetchImpl, surfaceUrl, mutationToken) {
  return tryPostSurfaceInputCommand(
    fetchImpl,
    surfaceUrl,
    mutationToken,
    "key-down KeyA shift,control",
    "key-down"
  );
}

async function waitForViewerSurfaceInputDenied(surfaceUrl, mutationToken, deadline, options) {
  while (options.now() <= deadline) {
    const denied = await tryPostSurfaceInputDenied(options.fetchImpl, surfaceUrl, mutationToken);
    if (denied) {
      return;
    }
    await options.sleep(100);
  }
  throw new Error("lifecycle-not-ready");
}

export async function tryPostSurfaceInputDenied(fetchImpl, surfaceUrl, mutationToken) {
  const result = await tryPostSurfaceInputCommandStatus(
    fetchImpl,
    surfaceUrl,
    mutationToken,
    "pointer-move 0.5 0.5"
  );
  return result === "denied";
}

async function waitForViewerSurfaceDisconnect(surfaceUrl, mutationToken, deadline, options) {
  while (options.now() <= deadline) {
    const accepted = await tryPostSurfaceDisconnect(options.fetchImpl, surfaceUrl, mutationToken);
    if (accepted) {
      return;
    }
    await options.sleep(100);
  }
  throw new Error("viewer-disconnect-not-ready");
}

export async function tryPostSurfaceDisconnect(fetchImpl, surfaceUrl, mutationToken) {
  try {
    const response = await fetchImpl(`${surfaceUrl}disconnect`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: surfaceUrl.replace(/\/$/, ""),
        "x-winbridge-local-surface-token": mutationToken
      },
      body: JSON.stringify({})
    });
    const body = await response.json();
    return response.status === 202 && body?.ok === true && body.action === "disconnect";
  } catch {
    return false;
  }
}

async function tryPostSurfaceInputCommand(fetchImpl, surfaceUrl, mutationToken, command, expectedKind) {
  const result = await tryPostSurfaceInputCommandStatus(fetchImpl, surfaceUrl, mutationToken, command);
  return result !== "denied" && result?.ok === true && result.action === "input" && result.kind === expectedKind;
}

async function tryPostSurfaceInputCommandStatus(fetchImpl, surfaceUrl, mutationToken, command) {
  try {
    const response = await fetchImpl(`${surfaceUrl}input`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: surfaceUrl.replace(/\/$/, ""),
        "x-winbridge-local-surface-token": mutationToken
      },
      body: JSON.stringify({ command })
    });
    const body = await response.json();
    if (response.status === 202) {
      return body;
    }
    if (response.status === 409 && body?.ok === false && body.error === "not-ready") {
      return "denied";
    }
    return undefined;
  } catch {
    return undefined;
  }
}

async function waitForSmokeAuditLogs(auditPaths, deadline, options) {
  while (options.now() <= deadline) {
    if (auditPaths.every((auditPath) => tryReadSmokeAuditLog(auditPath))) {
      return;
    }
    await options.sleep(100);
  }
  throw new Error("audit-not-ready");
}

async function waitForSmokeAuditSummary(hostAuditPath, viewerAuditPath, deadline, options) {
  while (options.now() <= deadline) {
    const summary = tryReadSmokeAuditSummary(hostAuditPath, viewerAuditPath);
    if (summary) {
      return summary;
    }
    await options.sleep(100);
  }
  throw new Error("audit-not-ready");
}

async function waitForWindowsInputAudit(hostAuditPath, deadline, options) {
  while (options.now() <= deadline) {
    try {
      if (hasSmokeAuditLogAction(readFileSync(hostAuditPath, "utf8"), WINDOWS_INPUT_APPLIED_AUDIT_ACTION)) {
        return;
      }
    } catch {
      // Keep polling until the bounded deadline.
    }
    await options.sleep(100);
  }
  throw new Error("windows-input-not-ready");
}

export function tryReadSmokeAuditLog(auditPath) {
  try {
    return summarizeSmokeAuditLogContent(readFileSync(auditPath, "utf8")) !== undefined;
  } catch {
    return false;
  }
}

export function hasUsableSmokeAuditLogContent(content) {
  return summarizeSmokeAuditLogContent(content) !== undefined;
}

export function hasSmokeAuditLogAction(content, action) {
  if (typeof action !== "string" || action.length === 0 || action.length > 160) {
    return false;
  }
  const records = parseSmokeAuditLogRecords(content);
  return records?.some((record) => record.action === action && record.outcome === "accepted") === true;
}

export function tryReadSmokeAuditSummary(hostAuditPath, viewerAuditPath) {
  try {
    const host = summarizeSmokeAuditLogContent(readFileSync(hostAuditPath, "utf8"), "host");
    const viewer = summarizeSmokeAuditLogContent(readFileSync(viewerAuditPath, "utf8"), "viewer");
    if (!host || !viewer || !hasRequiredSmokeAuditEvidence({ host, viewer })) {
      return undefined;
    }
    return { host, viewer };
  } catch {
    return undefined;
  }
}

export function summarizeSmokeAuditLogContent(content, role) {
  const records = parseSmokeAuditLogRecords(content);
  if (records === undefined) {
    return undefined;
  }

  const summary = createEmptySmokeAuditRoleSummary();
  for (const record of records) {
    summary.records += 1;
    summary[record.outcome] += 1;
    const coverageFlag = SMOKE_AUDIT_SUMMARY_ACTIONS[record.action];
    if (coverageFlag && record.outcome === "accepted") {
      summary[coverageFlag] = true;
    }
    const requiredEvidence = roleRequiredSmokeAuditEvidenceFlag(role, record.action, record.outcome);
    if (requiredEvidence) {
      summary[REQUIRED_SMOKE_AUDIT_EVIDENCE][requiredEvidence] = true;
    }
  }

  return summary.records > 0 ? summary : undefined;
}

function parseSmokeAuditLogRecords(content) {
  if (typeof content !== "string") {
    return undefined;
  }
  if (Buffer.byteLength(content, "utf8") > SMOKE_AUDIT_LOG_CONTENT_LIMIT_BYTES) {
    return undefined;
  }

  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) {
    return undefined;
  }

  const records = [];
  for (const line of lines) {
    if (Buffer.byteLength(line, "utf8") > SMOKE_AUDIT_LOG_LINE_LIMIT_BYTES) {
      return undefined;
    }
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      return undefined;
    }
    if (!isSmokeAuditRecordLike(record)) {
      return undefined;
    }
    records.push(record);
  }

  return records;
}

function isSmokeAuditRecordLike(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return (
    isBoundedAuditString(value.eventId, 8, 160) &&
    isIsoTimestamp(value.timestamp) &&
    isBoundedAuditString(value.action, 1, 160) &&
    ["accepted", "denied", "failed"].includes(value.outcome) &&
    value.actor !== null &&
    typeof value.actor === "object" &&
    !Array.isArray(value.actor) &&
    (value.detail === undefined ||
      (value.detail !== null && typeof value.detail === "object" && !Array.isArray(value.detail)))
  );
}

function isBoundedAuditString(value, minLength, maxLength) {
  return typeof value === "string" && value.length >= minLength && value.length <= maxLength;
}

function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function createEmptySmokeAuditRoleSummary() {
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
  Object.defineProperty(summary, REQUIRED_SMOKE_AUDIT_EVIDENCE, {
    value: createEmptySmokeAuditEvidencePresence(),
    enumerable: false
  });
  return summary;
}

function createEmptySmokeAuditEvidencePresence() {
  return Object.fromEntries(SMOKE_AUDIT_SUMMARY_FLAGS.map((flag) => [flag, false]));
}

function roleRequiredSmokeAuditEvidenceFlag(role, action, outcome) {
  if (outcome !== "accepted") {
    return undefined;
  }
  return REQUIRED_SMOKE_AUDIT_ACTIONS_BY_ROLE[role]?.[action];
}

function hasRequiredSmokeAuditEvidence(summary) {
  return (
    hasRequiredSmokeAuditRoleEvidence(
      summary.host?.[REQUIRED_SMOKE_AUDIT_EVIDENCE],
      REQUIRED_SMOKE_AUDIT_EVIDENCE_BY_ROLE.host
    ) &&
    hasRequiredSmokeAuditRoleEvidence(
      summary.viewer?.[REQUIRED_SMOKE_AUDIT_EVIDENCE],
      REQUIRED_SMOKE_AUDIT_EVIDENCE_BY_ROLE.viewer
    )
  );
}

function hasRequiredSmokeAuditRoleEvidence(summary, requiredFlags) {
  return requiredFlags.every((flag) => summary?.[flag] === true);
}

function formatSmokeAuditSummaryLines(summary) {
  const safeSummary = sanitizeSmokeAuditSummary(summary);
  if (!safeSummary) {
    return [];
  }

  const coverage = SMOKE_AUDIT_SUMMARY_FLAGS.filter(
    (flag) => safeSummary.host[flag] === true || safeSummary.viewer[flag] === true
  );
  return [
    formatSmokeAuditRoleSummaryLine("host", safeSummary.host),
    formatSmokeAuditRoleSummaryLine("viewer", safeSummary.viewer),
    `audit.coverage=${coverage.length > 0 ? coverage.join(",") : "none"}`
  ];
}

function formatSmokeAuditRoleSummaryLine(role, summary) {
  return `audit.${role}.records=${summary.records} accepted=${summary.accepted} denied=${summary.denied} failed=${summary.failed}`;
}

function sanitizeSmokeAuditSummary(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const keys = Object.keys(value);
  if (keys.length !== 2 || !keys.includes("host") || !keys.includes("viewer")) {
    return undefined;
  }

  const host = sanitizeSmokeAuditRoleSummary(value.host);
  const viewer = sanitizeSmokeAuditRoleSummary(value.viewer);
  return host && viewer ? { host, viewer } : undefined;
}

function sanitizeSmokeAuditRoleSummary(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const expectedKeys = [
    "records",
    "accepted",
    "denied",
    "failed",
    ...SMOKE_AUDIT_SUMMARY_FLAGS
  ];
  const keys = Object.keys(value);
  if (keys.length !== expectedKeys.length || !expectedKeys.every((key) => keys.includes(key))) {
    return undefined;
  }

  const summary = {};
  for (const key of ["records", "accepted", "denied", "failed"]) {
    const count = value[key];
    if (!Number.isSafeInteger(count) || count < 0 || count > 100_000) {
      return undefined;
    }
    summary[key] = count;
  }
  if (summary.accepted + summary.denied + summary.failed !== summary.records) {
    return undefined;
  }
  for (const key of SMOKE_AUDIT_SUMMARY_FLAGS) {
    if (typeof value[key] !== "boolean") {
      return undefined;
    }
    summary[key] = value[key];
  }
  return summary;
}

async function tryFetchText(fetchImpl, url) {
  try {
    const response = await fetchImpl(url, { cache: "no-store" });
    if (!response.ok) {
      return undefined;
    }
    return await response.text();
  } catch {
    return undefined;
  }
}

async function tryFetchFrame(fetchImpl, url) {
  try {
    const response = await fetchImpl(url, { cache: "no-store" });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(png|jpeg)\b/.test(contentType)) {
      return false;
    }
    const body = await response.arrayBuffer();
    return body.byteLength > 0;
  } catch {
    return false;
  }
}

function assertChildRunning(handle) {
  if (handle.exited) {
    throw new Error(`${handle.label}-exited`);
  }
}

function parseIntegerOption(raw, min, max) {
  if (typeof raw !== "string" || raw.trim() !== raw) {
    throw new MvpSessionSmokeUsageError();
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < min || value > max || String(value) !== raw) {
    throw new MvpSessionSmokeUsageError();
  }
  return value;
}

function parseSmokeTokenEnvName(raw) {
  if (typeof raw !== "string" || raw.trim() !== raw || !ENV_NAME_PATTERN.test(raw)) {
    throw new MvpSessionSmokeUsageError();
  }
  return raw;
}

function parseOptionalSmokeSharedToken(raw) {
  if (raw === undefined) {
    return undefined;
  }

  if (
    typeof raw !== "string" ||
    raw.length === 0 ||
    raw.trim() !== raw ||
    Buffer.byteLength(raw, "utf8") > RELAY_SHARED_TOKEN_MAX_BYTES ||
    hasAsciiControlCharacter(raw) ||
    hasUnicodeFormatControl(raw)
  ) {
    throw new MvpSessionSmokeUsageError();
  }

  return raw;
}

export function resolveMvpSmokeTokenEnv(env, tokenEnv) {
  if (tokenEnv === undefined) {
    return undefined;
  }
  const envName = parseSmokeTokenEnvName(tokenEnv);
  if (typeof env?.[envName] !== "string") {
    throw new MvpSessionSmokeUsageError();
  }
  return parseOptionalSmokeSharedToken(env[envName]);
}

function hasAsciiControlCharacter(value) {
  return /[\u0000-\u001F\u007F]/u.test(value);
}

function hasUnicodeFormatControl(value) {
  return /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/u.test(value);
}

function defaultNpmInvocation() {
  if (process.env.npm_execpath) {
    return { command: process.execPath, argsPrefix: [process.env.npm_execpath] };
  }

  if (process.platform === "win32") {
    return { command: "cmd.exe", argsPrefix: ["/d", "/s", "/c", "npm"] };
  }

  return { command: "npm", argsPrefix: [] };
}

async function killProcessTree(pid) {
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/t", "/f"], { stdio: "ignore" });
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return;
  }
  await sleep(250);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCli(rawArgs = process.argv.slice(2), streams = process) {
  const wantsJson = rawArgs.includes("--json");
  try {
    const parsed = parseMvpSessionSmokeArgs(rawArgs);
    if (parsed.help) {
      streams.stdout.write(`${MVP_SESSION_SMOKE_USAGE}\n`);
      return 0;
    }

    const sharedToken = resolveMvpSmokeTokenEnv(process.env, parsed.tokenEnv);
    const result = await runMvpSessionSmokeCheck({
      timeoutMs: parsed.timeoutMs,
      keepArtifacts: parsed.keepArtifacts,
      lanRelay: parsed.lanRelay,
      windowsCapture: parsed.windowsCapture,
      windowsInput: parsed.windowsInput,
      sharedToken
    });
    streams.stdout.write(
      `${
        parsed.json
          ? formatMvpSessionSmokeJsonSuccess(result, parsed)
          : formatMvpSessionSmokeSuccess(result, parsed)
      }\n`
    );
    return 0;
  } catch (error) {
    streams.stderr.write(
      `${wantsJson ? formatMvpSessionSmokeJsonError(error, { windowsInput: rawArgs.includes("--windows-input") }) : formatMvpSessionSmokeError(error)}\n`
    );
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = await runCli();
}
