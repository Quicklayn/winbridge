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
  captureIntervalMs: 250
});

export const MVP_SESSION_SMOKE_USAGE = [
  "Usage: npm run mvp:smoke -- [options]",
  "",
  "Options:",
  "  --timeout-ms 45000",
  "  --keep-artifacts",
  "  --json",
  "",
  "The smoke check starts local relay, host, and viewer development processes",
  "with static frames only. It does not use Windows capture, OS input, tokens,",
  "browser automation, services, startup persistence, or unattended access."
].join("\n");

const SAFE_TIMER_DELAY_MS = 2_147_483_647;
const OUTPUT_LIMIT_BYTES = 4096;
const MVP_SMOKE_CHECK_NAMES = Object.freeze(["relay", "frame", "surface", "signal", "input", "audit"]);
const MVP_SMOKE_FAILURE_CHECK_INDEX = Object.freeze({
  "relay-not-ready": 0,
  "port-unavailable": 0,
  "frame-not-ready": 1,
  "surface-not-ready": 2,
  "signal-not-ready": 3,
  "input-not-ready": 4,
  "audit-not-ready": 5
});

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
  let sawTimeout = false;

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

    if (!key?.startsWith("--")) {
      throw new MvpSessionSmokeUsageError();
    }
    throw new MvpSessionSmokeUsageError();
  }

  return {
    help: false,
    timeoutMs,
    keepArtifacts,
    json
  };
}

export function createMvpSmokePlan(options) {
  const npmInvocation = options.npmCommand
    ? { command: options.npmCommand, argsPrefix: [] }
    : defaultNpmInvocation();
  const session = options.session ?? `smoke-${Date.now()}`;
  const relayUrl = `ws://127.0.0.1:${options.relayPort}/`;
  const framePath = join(options.workDir, "frames", "latest.png");
  const hostAuditPath = join(options.workDir, "logs", "host-audit.jsonl");
  const viewerAuditPath = join(options.workDir, "logs", "viewer-audit.jsonl");

  return {
    session,
    framePath,
    hostAuditPath,
    viewerAuditPath,
    relay: {
      label: "relay",
      command: npmInvocation.command,
      args: [...npmInvocation.argsPrefix, "--workspace", "@winbridge/relay", "run", "dev"],
      env: { WINBRIDGE_RELAY_PORT: String(options.relayPort) }
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
        "--audit-log",
        hostAuditPath,
        "--dev-screen-frame-after-ms",
        String(DEFAULT_MVP_SMOKE_OPTIONS.captureAfterMs),
        "--dev-screen-frame-source",
        "static",
        "--dev-screen-frame-count",
        String(DEFAULT_MVP_SMOKE_OPTIONS.captureCount),
        "--dev-screen-frame-interval-ms",
        String(DEFAULT_MVP_SMOKE_OPTIONS.captureIntervalMs)
      ],
      env: {}
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
        String(options.surfacePort)
      ],
      env: {}
    },
    surfaceUrl: `http://127.0.0.1:${options.surfacePort}/`
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
  const deadline = options.now() + options.timeoutMs;
  const workDir = rawOptions.workDir ?? mkdtempSync(join(tmpdir(), "winbridge-mvp-smoke-"));
  const relayPort = rawOptions.relayPort ?? 0;
  const surfacePort = rawOptions.surfacePort ?? (await findAvailableLoopbackPort());
  const plan = createMvpSmokePlan({ ...rawOptions, workDir, relayPort, surfacePort });
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
      : createMvpSmokePlan({ ...rawOptions, workDir, relayPort: resolvedRelayPort, surfacePort });

  const host = startSmokeProcess(readyPlan.host, options);
  children.push(host);
  await waitForHostPairingTicket(relay, deadline, options);
  const viewer = startSmokeProcess(readyPlan.viewer, options);
  children.push(viewer);

  await waitForFrameFile(readyPlan.framePath, deadline, options);
  const surface = await waitForViewerSurface(readyPlan.surfaceUrl, deadline, options);
  await waitForViewerSignalReadiness(readyPlan.surfaceUrl, deadline, options);
  await waitForViewerSurfaceInput(readyPlan.surfaceUrl, surface.mutationToken, deadline, options);
  await waitForSmokeAuditLogs(
    [readyPlan.hostAuditPath, readyPlan.viewerAuditPath],
    deadline,
    options
  );

  return {
    ok: true,
    workDir,
    framePath: readyPlan.framePath,
    surfaceUrl: readyPlan.surfaceUrl
  };
}

export function startSmokeProcess(plan, options = {}) {
  const spawnProcess = options.spawnProcess ?? spawn;
  let child;
  try {
    child = spawnProcess(plan.command, plan.args, {
      cwd: options.cwd ?? process.cwd(),
      env: { ...process.env, ...plan.env },
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
    "surface=verified",
    "frame=verified",
    "signal=verified",
    "input=verified",
    "audit=verified",
    options.keepArtifacts ? `artifacts=${result.workDir}` : "artifacts=cleaned"
  ].join("\n");
}

export function formatMvpSessionSmokeJsonSuccess(result, options = {}) {
  return JSON.stringify({
    ok: true,
    checks: MVP_SMOKE_CHECK_NAMES.map((name) => ({ name, ok: true })),
    artifacts: options.keepArtifacts ? "retained" : "cleaned",
    ...(options.keepArtifacts ? { artifactDir: result.workDir } : {})
  });
}

export function formatMvpSessionSmokeJsonError(error) {
  const reason = safeSmokeJsonFailureReason(error);
  const checks = smokeFailureChecksForReason(reason);
  return JSON.stringify({
    ok: false,
    ...(reason ? { reason } : {}),
    ...(checks ? { checks } : {})
  });
}

function smokeFailureChecksForReason(reason) {
  if (!reason || !Object.hasOwn(MVP_SMOKE_FAILURE_CHECK_INDEX, reason)) {
    return undefined;
  }

  const failedIndex = MVP_SMOKE_FAILURE_CHECK_INDEX[reason];
  return MVP_SMOKE_CHECK_NAMES.map((name, index) => {
    if (index < failedIndex) {
      return { name, ok: true };
    }
    if (index === failedIndex) {
      return { name, ok: false };
    }
    return { name, ok: false, skipped: true };
  });
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
      "frame-not-ready",
      "surface-not-ready",
      "signal-not-ready",
      "input-not-ready",
      "audit-not-ready",
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
    return body?.ok === true && body.state?.signalProbeAckReceived === true;
  } catch {
    return false;
  }
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

async function tryPostSurfaceInputCommand(fetchImpl, surfaceUrl, mutationToken, command, expectedKind) {
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
    if (response.status !== 202) {
      return false;
    }

    const body = await response.json();
    return body?.ok === true && body.action === "input" && body.kind === expectedKind;
  } catch {
    return false;
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

export function tryReadSmokeAuditLog(auditPath) {
  try {
    return hasUsableSmokeAuditLogContent(readFileSync(auditPath, "utf8"));
  } catch {
    return false;
  }
}

export function hasUsableSmokeAuditLogContent(content) {
  if (typeof content !== "string") {
    return false;
  }

  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
  return lines.some((line) => {
    try {
      return isSmokeAuditRecordLike(JSON.parse(line));
    } catch {
      return false;
    }
  });
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

async function findAvailableLoopbackPort() {
  const { createServer } = await import("node:net");
  return await new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : undefined;
      server.close(() => {
        if (port === undefined) {
          reject(new Error("port-unavailable"));
          return;
        }
        resolve(port);
      });
    });
  });
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

    const result = await runMvpSessionSmokeCheck({
      timeoutMs: parsed.timeoutMs,
      keepArtifacts: parsed.keepArtifacts
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
      `${wantsJson ? formatMvpSessionSmokeJsonError(error) : formatMvpSessionSmokeError(error)}\n`
    );
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = await runCli();
}
