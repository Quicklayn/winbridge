import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

export const DEFAULT_MVP_LAN_PROBE_OPTIONS = Object.freeze({
  timeoutMs: 15000
});

export const MVP_LAN_PROBE_USAGE = [
  "Usage: npm run mvp:lan-probe -- --role host|viewer --relay ws://RELAY-PC:8787/ --session SESSION --pairing 123-456 --peer PEER --device DEVICE [options]",
  "",
  "Options:",
  "  --role host|viewer",
  "  --relay ws://RELAY-PC:8787/",
  "  --session demo",
  "  --pairing 123-456",
  "  --peer host-probe|viewer-probe",
  "  --device host-device|viewer-device",
  "  --timeout-ms 15000",
  "  --token-env WINBRIDGE_RELAY_SHARED_TOKEN",
  "  --json",
  "",
  "The LAN probe sends only a join-session message and waits for paired relay",
  "readiness. It does not request consent, grant permissions, capture screen",
  "frames, send input, write audit files, start local surfaces, or open browsers."
].join("\n");

const SAFE_TIMER_DELAY_MS = 2_147_483_647;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 60000;
const RELAY_SHARED_TOKEN_MAX_BYTES = 1024;
const ENV_NAME_PATTERN = /^[A-Z_][A-Z0-9_]{0,127}$/;
const PROTOCOL_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;
const PAIRING_CODE_PATTERN = /^\d{3}-\d{3}$/;
const SAFE_RELAY_HOST_PATTERN =
  /^(localhost|127\.0\.0\.1|[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*|\d{1,3}(?:\.\d{1,3}){3})$/;
const SECRET_MARKER_PATTERN =
  /(^|[._:\-/\\])(token|credential|credentials|password|passphrase|secret|api[-_:.]?key|access[-_:.]?key|cookie|private[-_:.]?key|ssh[-_:.]?key|authorization|auth[-_:.]?header|proxy[-_:.]?authorization)([=._:\-/\\]|$)/i;
const SAFE_FAILURE_REASONS = new Set([
  "usage",
  "token-env-missing",
  "connect-failed",
  "socket-closed",
  "relay-error",
  "unexpected-message",
  "timeout"
]);
const SUCCESS_CHECKS = Object.freeze(["connect", "join", "paired"]);

export class MvpLanProbeUsageError extends Error {
  constructor() {
    super(MVP_LAN_PROBE_USAGE);
    this.name = "MvpLanProbeUsageError";
  }
}

export class MvpLanProbeError extends Error {
  constructor(reason) {
    super(`WinBridge MVP LAN probe failed. reason=${reason}`);
    this.name = "MvpLanProbeError";
    this.reason = SAFE_FAILURE_REASONS.has(reason) ? reason : "connect-failed";
  }
}

export function parseMvpLanProbeArgs(rawArgs) {
  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }

  if (rawArgs.includes("--help")) {
    throw new MvpLanProbeUsageError();
  }

  const options = parseOptionMap(rawArgs);
  const role = parseRole(requireOption(options, "role"));
  const relay = parseRelayUrl(requireOption(options, "relay"));
  const session = parseProtocolIdentifier(requireOption(options, "session"));
  const pairing = parsePairingCode(requireOption(options, "pairing"));
  const peer = parseProtocolIdentifier(requireOption(options, "peer"));
  const device = parseProtocolIdentifier(requireOption(options, "device"));
  const timeoutMs = parseIntegerOption(
    options.get("timeout-ms") ?? String(DEFAULT_MVP_LAN_PROBE_OPTIONS.timeoutMs),
    MIN_TIMEOUT_MS,
    MAX_TIMEOUT_MS
  );
  const tokenEnv = parseOptionalTokenEnv(options.get("token-env"));

  return {
    help: false,
    json: options.has("json"),
    role,
    relay,
    session,
    pairing,
    peer,
    device,
    timeoutMs,
    ...(tokenEnv ? { tokenEnv } : {})
  };
}

export function resolveMvpLanProbeTokenEnv(env, tokenEnv) {
  if (!tokenEnv) {
    return undefined;
  }

  const token = env[tokenEnv];
  if (typeof token !== "string" || !isSafeTokenValue(token)) {
    throw new MvpLanProbeError("token-env-missing");
  }

  return token;
}

export async function runMvpLanProbe(rawOptions, dependencies = {}) {
  const token = resolveMvpLanProbeTokenEnv(dependencies.env ?? process.env, rawOptions.tokenEnv);
  const WebSocketClient = dependencies.WebSocketClient ?? WebSocket;
  const now = dependencies.now ?? (() => new Date());
  const timeout = dependencies.setTimeout ?? setTimeout;
  const clear = dependencies.clearTimeout ?? clearTimeout;
  const relayUrl = token ? appendRelayToken(rawOptions.relay, token) : rawOptions.relay;
  const startedAt = now().toISOString();

  return new Promise((resolve, reject) => {
    let settled = false;
    let joined = false;
    let paired = false;
    let socket;
    const timer = timeout(() => finish(new MvpLanProbeError("timeout")), rawOptions.timeoutMs);

    const finish = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      clear(timer);
      if (socket && socket.readyState === WebSocketClient.OPEN) {
        socket.close(1000, "probe-complete");
      }

      if (result instanceof Error) {
        reject(result);
        return;
      }

      resolve(result);
    };

    try {
      socket = new WebSocketClient(relayUrl);
    } catch {
      finish(new MvpLanProbeError("connect-failed"));
      return;
    }

    socket.once("open", () => {
      joined = true;
      try {
        socket.send(JSON.stringify(createJoinEnvelope(rawOptions)));
      } catch {
        finish(new MvpLanProbeError("connect-failed"));
      }
    });

    socket.on("message", (raw) => {
      let message;
      try {
        message = JSON.parse(String(raw));
      } catch {
        finish(new MvpLanProbeError("unexpected-message"));
        return;
      }

      if (isLocalPairedRelayReady(message, rawOptions)) {
        paired = true;
        finish({
          ok: true,
          role: rawOptions.role,
          checks: SUCCESS_CHECKS.map((name) => ({ name, ok: true })),
          startedAt,
          completedAt: now().toISOString()
        });
        return;
      }

      if (isRelayError(message)) {
        finish(new MvpLanProbeError("relay-error"));
        return;
      }

      if (!isLocalUnpairedRelayReady(message, rawOptions)) {
        finish(new MvpLanProbeError("unexpected-message"));
      }
    });

    socket.once("error", () => finish(new MvpLanProbeError(joined ? "socket-closed" : "connect-failed")));
    socket.once("close", () => {
      if (!settled && !paired) {
        finish(new MvpLanProbeError(joined ? "socket-closed" : "connect-failed"));
      }
    });
  });
}

export function formatMvpLanProbeSuccess(result, options = {}) {
  const safe = sanitizeProbeSuccess(result);
  if (options.json) {
    return `${JSON.stringify(safe, null, 2)}\n`;
  }

  return [
    "WinBridge MVP LAN probe passed.",
    `role=${safe.role}`,
    ...safe.checks.map((check) => `${check.name}=verified`)
  ].join("\n") + "\n";
}

export function formatMvpLanProbeError(error, options = {}) {
  const reason = error instanceof MvpLanProbeUsageError ? "usage" : safeProbeFailureReason(error?.reason);
  if (options.json) {
    return `${JSON.stringify(
      {
        ok: false,
        reason,
        checks: failureChecks(reason)
      },
      null,
      2
    )}\n`;
  }

  return reason === "usage"
    ? `${MVP_LAN_PROBE_USAGE}\n`
    : `WinBridge MVP LAN probe failed. reason=${reason}\n`;
}

function parseOptionMap(rawArgs) {
  const options = new Map();
  const allowed = new Set([
    "role",
    "relay",
    "session",
    "pairing",
    "peer",
    "device",
    "timeout-ms",
    "token-env",
    "json"
  ]);

  for (let index = 0; index < rawArgs.length;) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) {
      throw new MvpLanProbeUsageError();
    }

    const key = arg.slice(2);
    if (!allowed.has(key) || options.has(key)) {
      throw new MvpLanProbeUsageError();
    }

    if (key === "json") {
      options.set(key, true);
      index += 1;
      continue;
    }

    const value = rawArgs[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new MvpLanProbeUsageError();
    }

    options.set(key, value);
    index += 2;
  }

  return options;
}

function requireOption(options, name) {
  const value = options.get(name);
  if (typeof value !== "string") {
    throw new MvpLanProbeUsageError();
  }
  return value;
}

function parseRole(value) {
  if (value !== "host" && value !== "viewer") {
    throw new MvpLanProbeUsageError();
  }
  return value;
}

function parseRelayUrl(value) {
  if (isUnsafeScalar(value)) {
    throw new MvpLanProbeUsageError();
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new MvpLanProbeUsageError();
  }

  const host = url.hostname;
  if (
    url.protocol !== "ws:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    !url.port ||
    !SAFE_RELAY_HOST_PATTERN.test(host) ||
    isUnsafeScalar(host) ||
    hasSecretBearingMetadata(host) ||
    !isValidRelayPort(url.port) ||
    isUnspecifiedRelayHost(host)
  ) {
    throw new MvpLanProbeUsageError();
  }

  if (isIpv4Literal(host) && !hasValidIpv4Octets(host)) {
    throw new MvpLanProbeUsageError();
  }

  return url.toString();
}

function parseProtocolIdentifier(value) {
  if (isUnsafeScalar(value) || hasSecretBearingMetadata(value) || !PROTOCOL_IDENTIFIER_PATTERN.test(value)) {
    throw new MvpLanProbeUsageError();
  }
  return value;
}

function parsePairingCode(value) {
  if (isUnsafeScalar(value) || !PAIRING_CODE_PATTERN.test(value)) {
    throw new MvpLanProbeUsageError();
  }
  return value;
}

function parseIntegerOption(value, min, max) {
  if (isUnsafeScalar(value) || !/^\d+$/.test(value)) {
    throw new MvpLanProbeUsageError();
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max || parsed > SAFE_TIMER_DELAY_MS) {
    throw new MvpLanProbeUsageError();
  }
  return parsed;
}

function parseOptionalTokenEnv(value) {
  if (value === undefined) {
    return undefined;
  }

  if (isUnsafeScalar(value) || !ENV_NAME_PATTERN.test(value)) {
    throw new MvpLanProbeUsageError();
  }

  return value;
}

function isSafeTokenValue(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    Buffer.byteLength(value, "utf8") <= RELAY_SHARED_TOKEN_MAX_BYTES &&
    !hasAsciiControlCharacter(value) &&
    !hasUnsafeFormatCharacter(value)
  );
}

function appendRelayToken(relayUrl, token) {
  const url = new URL(relayUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

function createJoinEnvelope(options) {
  return {
    protocolVersion: 1,
    messageId: randomUUID(),
    sessionId: options.session,
    createdAt: new Date().toISOString(),
    type: "join-session",
    peerId: options.peer,
    role: options.role,
    pairingCode: options.pairing,
    deviceIdentity: {
      deviceId: options.device,
      displayName: options.role === "host" ? "WinBridge LAN Probe Host" : "WinBridge LAN Probe Viewer",
      platform: "windows"
    }
  };
}

function isLocalPairedRelayReady(message, options) {
  return (
    isLocalUnpairedRelayReady(message, options) &&
    Number.isInteger(message.roomSize) &&
    message.roomSize >= 2
  );
}

function isLocalUnpairedRelayReady(message, options) {
  return (
    message &&
    typeof message === "object" &&
    !Array.isArray(message) &&
    message.type === "relay-ready" &&
    message.protocolVersion === 1 &&
    message.sessionId === options.session &&
    message.peerId === options.peer &&
    Number.isInteger(message.roomSize) &&
    message.roomSize >= 1 &&
    message.roomSize <= 2
  );
}

function isRelayError(message) {
  return message && typeof message === "object" && !Array.isArray(message) && message.type === "relay-error";
}

function sanitizeProbeSuccess(result) {
  const role = result?.role === "host" || result?.role === "viewer" ? result.role : "host";
  return {
    ok: true,
    role,
    checks: SUCCESS_CHECKS.map((name) => ({ name, ok: true }))
  };
}

function failureChecks(reason) {
  const failedIndex =
    reason === "connect-failed" || reason === "token-env-missing" || reason === "usage"
      ? 0
      : reason === "timeout" || reason === "socket-closed" || reason === "relay-error" || reason === "unexpected-message"
        ? 2
        : 0;
  return SUCCESS_CHECKS.map((name, index) => ({ name, ok: index < failedIndex }));
}

function safeProbeFailureReason(reason) {
  return SAFE_FAILURE_REASONS.has(reason) ? reason : "connect-failed";
}

function isValidRelayPort(value) {
  return /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 65535;
}

function isIpv4Literal(value) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value);
}

function hasValidIpv4Octets(value) {
  return value.split(".").every((octet) => {
    const parsed = Number(octet);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 255;
  });
}

function isUnspecifiedRelayHost(value) {
  return value === "0.0.0.0";
}

function isUnsafeScalar(value) {
  return (
    typeof value !== "string" ||
    value.length === 0 ||
    value !== value.trim() ||
    hasAsciiControlCharacter(value) ||
    hasUnsafeFormatCharacter(value)
  );
}

function hasAsciiControlCharacter(value) {
  return /[\u0000-\u001f\u007f]/u.test(value);
}

function hasUnsafeFormatCharacter(value) {
  return /[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/u.test(value);
}

function hasSecretBearingMetadata(value) {
  return SECRET_MARKER_PATTERN.test(value);
}

export async function main(rawArgs = process.argv.slice(2), streams = process, dependencies = {}) {
  let parsed;
  try {
    parsed = parseMvpLanProbeArgs(rawArgs);
    if (parsed.help) {
      streams.stdout.write(`${MVP_LAN_PROBE_USAGE}\n`);
      return 0;
    }

    const result = await runMvpLanProbe(parsed, dependencies);
    streams.stdout.write(formatMvpLanProbeSuccess(result, parsed));
    return 0;
  } catch (error) {
    const json = parsed?.json === true || rawArgs.includes("--json");
    const output = formatMvpLanProbeError(
      error instanceof MvpLanProbeUsageError
        ? error
        : error instanceof MvpLanProbeError
          ? error
          : new MvpLanProbeError("connect-failed"),
      { json }
    );
    streams.stderr.write(output);
    return 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const exitCode = await main();
  process.exit(exitCode);
}
