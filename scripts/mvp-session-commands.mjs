import { randomInt } from "node:crypto";
import { fileURLToPath } from "node:url";

export const DEFAULT_MVP_SESSION_COMMAND_OPTIONS = Object.freeze({
  session: "demo",
  pairing: "123-456",
  relay: "ws://localhost:8787/",
  hostName: "WinBridge Assisted Host",
  viewerName: "WinBridge Support Viewer",
  requestReason: "MVP remote assistance session",
  hostAuditLog: "logs\\host-audit.jsonl",
  viewerAuditLog: "logs\\viewer-audit.jsonl",
  viewerFrameOutput: "frames\\latest.jpg",
  viewerControlSurfacePort: 35987,
  viewerSignalProbeAfterMs: 1000,
  captureAfterMs: 1000,
  captureDurationMinutes: 10,
  captureCount: 100,
  captureIntervalMs: 1000
});

export const MVP_SESSION_COMMAND_KIT_USAGE = [
  "Usage: npm run mvp:commands -- [options]",
  "",
  "Options:",
  "  --session demo",
  "  --pairing 123-456",
  "  --relay ws://localhost:8787",
  "  --relay-host RELAY-PC-LAN-IP",
  "  --host-name \"WinBridge Assisted Host\"",
  "  --viewer-name \"WinBridge Support Viewer\"",
  "  --request-reason \"MVP remote assistance session\"",
  "  --host-audit-log logs\\host-audit.jsonl",
  "  --viewer-audit-log logs\\viewer-audit.jsonl",
  "  --viewer-frame-output frames\\latest.jpg",
  "  --viewer-control-surface-port 35987",
  "  --viewer-signal-probe-after-ms 1000",
  "  --capture-after-ms 1000",
  "  --capture-duration-minutes 10",
  "  --capture-count 100",
  "  --capture-interval-ms 1000",
  "  --token-env WINBRIDGE_RELAY_SHARED_TOKEN",
  "  --generate-pairing",
  "  --only relay|host|viewer|browser|preflight",
  "  --preflight-only",
  "  --json",
  "",
  "Raw token values are not accepted. Use --token-env NAME and set the",
  "environment variable in the terminals that run the printed commands."
].join("\n");

const SAFE_TIMER_DELAY_MS = 2_147_483_647;
const SAFE_PATH_MAX_LENGTH = 260;
const SAFE_DISPLAY_NAME_MAX_LENGTH = 120;
const SAFE_REASON_MAX_LENGTH = 240;
const MAX_CAPTURE_FRAME_COUNT = 1000;
const MAX_CAPTURE_DURATION_MINUTES = 16;
const PROTOCOL_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,127}$/;
const PAIRING_CODE_PATTERN = /^\d{3}-\d{3}$/;
const RELAY_HOST_SHORTCUT_PATTERN =
  /^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
const IPV4_LITERAL_PATTERN = /^\d{1,3}(?:\.\d{1,3}){3}$/;
const ENV_NAME_PATTERN = /^[A-Z_][A-Z0-9_]{0,127}$/;
const TOKEN_OPTION_NAMES = new Set(["token"]);
const COMMAND_ONLY_TARGETS = new Set(["relay", "host", "viewer", "browser", "preflight"]);
const ALL_SMOKE_READY_COMMAND = "npm run mvp:ready -- --include-all-smoke";
const KNOWN_OPTIONS = new Set([
  "session",
  "pairing",
  "relay",
  "relay-host",
  "host-name",
  "viewer-name",
  "request-reason",
  "host-audit-log",
  "viewer-audit-log",
  "viewer-frame-output",
  "viewer-control-surface-port",
  "viewer-signal-probe-after-ms",
  "capture-after-ms",
  "capture-duration-minutes",
  "capture-count",
  "capture-interval-ms",
  "token-env"
]);
const SECRET_MARKER_PATTERN =
  /(^|[._:\-/\\])(token|credential|credentials|password|passphrase|secret|api[-_:.]?key|access[-_:.]?key|cookie|private[-_:.]?key|ssh[-_:.]?key|authorization|auth[-_:.]?header|proxy[-_:.]?authorization)([=._:\-/\\]|$)/i;
const WINDOWS_RESERVED_PATH_SEGMENT_PATTERN = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
const EPHEMERAL_VIEWER_SURFACE_BROWSER_INSTRUCTION =
  "Open the viewer local control surface URL printed by the viewer command log.";

export class MvpSessionCommandKitUsageError extends Error {
  constructor() {
    super(MVP_SESSION_COMMAND_KIT_USAGE);
    this.name = "MvpSessionCommandKitUsageError";
  }
}

export function parseMvpSessionCommandArgs(rawArgs, dependencies = {}) {
  if (rawArgs.length === 1 && rawArgs[0] === "--help") {
    return { help: true };
  }

  if (rawArgs.includes("--help")) {
    throw new MvpSessionCommandKitUsageError();
  }

  const parsedFlags = parseCommandKitFlags(rawArgs);
  if (
    parsedFlags.onlyTarget &&
    (parsedFlags.preflightOnly || (parsedFlags.json && parsedFlags.onlyTarget !== "preflight"))
  ) {
    throw new MvpSessionCommandKitUsageError();
  }
  if (parsedFlags.onlyTarget && parsedFlags.generatePairing) {
    throw new MvpSessionCommandKitUsageError();
  }
  if (parsedFlags.preflightOnly && parsedFlags.generatePairing) {
    throw new MvpSessionCommandKitUsageError();
  }

  if (parsedFlags.preflightOnly) {
    const tokenEnv = parsePreflightSelectorTokenEnv(parsedFlags.remaining);
    return {
      help: false,
      json: parsedFlags.json,
      preflightOnly: true,
      ...(tokenEnv ? { tokenEnv } : {})
    };
  }

  if (parsedFlags.onlyTarget === "preflight") {
    if (parsedFlags.generatePairing) {
      throw new MvpSessionCommandKitUsageError();
    }
    const tokenEnv = parsePreflightSelectorTokenEnv(parsedFlags.remaining);
    return parsedFlags.json
      ? {
          help: false,
          json: true,
          preflightOnly: true,
          onlyTarget: "preflight",
          ...(tokenEnv ? { tokenEnv } : {})
        }
      : {
          help: false,
          json: false,
          preflightOnly: false,
          onlyTarget: "preflight",
          ...(tokenEnv ? { tokenEnv } : {})
        };
  }

  const options = parseOptionMap(parsedFlags.remaining);
  if (parsedFlags.generatePairing && options.has("pairing")) {
    throw new MvpSessionCommandKitUsageError();
  }
  if (options.has("relay-host") && options.has("relay")) {
    throw new MvpSessionCommandKitUsageError();
  }
  if (options.has("capture-duration-minutes") && options.has("capture-count")) {
    throw new MvpSessionCommandKitUsageError();
  }

  const tokenEnv = parseOptionalTokenEnv(options.get("token-env"));
  const pairing = parsedFlags.generatePairing
    ? parsePairingCode((dependencies.generatePairingCode ?? generatePairingCode)())
    : parsePairingCode(options.get("pairing") ?? DEFAULT_MVP_SESSION_COMMAND_OPTIONS.pairing);
  const relay = options.has("relay-host")
    ? buildRelayUrlFromHostShortcut(parseRelayHostShortcut(options.get("relay-host")))
    : parseRelayUrl(options.get("relay") ?? DEFAULT_MVP_SESSION_COMMAND_OPTIONS.relay);
  const captureIntervalMs = parseIntegerOption(
    options.get("capture-interval-ms") ??
      String(DEFAULT_MVP_SESSION_COMMAND_OPTIONS.captureIntervalMs),
    1,
    SAFE_TIMER_DELAY_MS
  );
  const captureDurationMinutes = parseCaptureDurationMinutes(
    options.get("capture-duration-minutes") ??
      (options.has("capture-count")
        ? undefined
        : String(DEFAULT_MVP_SESSION_COMMAND_OPTIONS.captureDurationMinutes))
  );

  return {
    help: false,
    json: parsedFlags.json,
    preflightOnly: false,
    ...(parsedFlags.onlyTarget ? { onlyTarget: parsedFlags.onlyTarget } : {}),
    session: parseProtocolIdentifier(options.get("session") ?? DEFAULT_MVP_SESSION_COMMAND_OPTIONS.session),
    pairing,
    relay,
    hostName: parseDisplayName(options.get("host-name") ?? DEFAULT_MVP_SESSION_COMMAND_OPTIONS.hostName),
    viewerName: parseDisplayName(options.get("viewer-name") ?? DEFAULT_MVP_SESSION_COMMAND_OPTIONS.viewerName),
    requestReason: parseRequestReason(
      options.get("request-reason") ?? DEFAULT_MVP_SESSION_COMMAND_OPTIONS.requestReason
    ),
    hostAuditLog: parseSafePath(
      options.get("host-audit-log") ?? DEFAULT_MVP_SESSION_COMMAND_OPTIONS.hostAuditLog
    ),
    viewerAuditLog: parseSafePath(
      options.get("viewer-audit-log") ?? DEFAULT_MVP_SESSION_COMMAND_OPTIONS.viewerAuditLog
    ),
    viewerFrameOutput: parseSafePath(
      options.get("viewer-frame-output") ?? DEFAULT_MVP_SESSION_COMMAND_OPTIONS.viewerFrameOutput
    ),
    viewerControlSurfacePort: parseViewerControlSurfacePortOption(
      options.get("viewer-control-surface-port") ??
        String(DEFAULT_MVP_SESSION_COMMAND_OPTIONS.viewerControlSurfacePort)
    ),
    viewerSignalProbeAfterMs: parseIntegerOption(
      options.get("viewer-signal-probe-after-ms") ??
        String(DEFAULT_MVP_SESSION_COMMAND_OPTIONS.viewerSignalProbeAfterMs),
      0,
      SAFE_TIMER_DELAY_MS
    ),
    captureAfterMs: parseIntegerOption(
      options.get("capture-after-ms") ?? String(DEFAULT_MVP_SESSION_COMMAND_OPTIONS.captureAfterMs),
      0,
      SAFE_TIMER_DELAY_MS
    ),
    captureCount: resolveCaptureCount(options.get("capture-count"), captureDurationMinutes, captureIntervalMs),
    captureIntervalMs,
    ...(captureDurationMinutes ? { captureDurationMinutes } : {}),
    ...(tokenEnv ? { tokenEnv } : {})
  };
}

export function renderMvpSessionCommands(parsed) {
  if (parsed.help) {
    return MVP_SESSION_COMMAND_KIT_USAGE;
  }

  if (parsed.json) {
    return formatMvpSessionCommandsJson(parsed);
  }

  if (parsed.preflightOnly) {
    return renderMvpPreflightOnlyCommands(parsed);
  }

  if (parsed.onlyTarget) {
    return renderMvpFilteredCommandTarget(parsed);
  }

  const browserCommand = renderBrowserCommandForViewerSurfacePort(parsed.viewerControlSurfacePort);
  const tokenNote = parsed.tokenEnv
    ? [
        "",
        "Token mode:",
        `- Set $env:${parsed.tokenEnv} to the bounded local relay token before running these commands.`,
        "- The token value is referenced through the environment and is not printed here."
      ].join("\n")
    : "";

  return [
    "# WinBridge MVP session commands",
    "",
    "Run each step in a visible PowerShell terminal. The host terminal is the",
    "development consent and control surface for this MVP workflow.",
    tokenNote,
    "",
    "0. Preflight before the two-PC trial:",
    "- On each Windows machine:",
    "npm run mvp:ready",
    "- Individual troubleshooting checks:",
    "npm run mvp:doctor",
    "npm run mvp:native-preflight",
    "- On one local development machine before the two-PC trial:",
    "npm run mvp:smoke",
    "- Full local smoke coverage before the two-PC trial:",
    ...renderAllSmokePreflightLines(parsed),
    "",
    "Relay address:",
    `- Current relay URL: ${parsed.relay}`,
    "- localhost relay URLs are same-machine only.",
    "- For a two-PC trial, rerun this helper with --relay-host <relay-pc-lan-ip> or --relay ws://<relay-pc-lan-ip>:8787.",
    "",
    "Capture schedule:",
    `- Host frame stream: ${parsed.captureCount} finite frame(s) at ${parsed.captureIntervalMs} ms intervals.`,
    ...(parsed.captureDurationMinutes
      ? [`- Duration shortcut: ${parsed.captureDurationMinutes} minute(s), derived to a bounded frame count.`]
      : ["- Manual count override: duration shortcut disabled for this plan."]),
    "",
    "1. Relay terminal:",
    renderRelayCommand(parsed),
    "",
    "2. Host terminal on the assisted Windows PC:",
    renderHostCommand(parsed),
    "",
    "3. Viewer terminal on the assisting Windows PC:",
    renderViewerCommand(parsed),
    "",
    "Signal readiness:",
    `- Viewer sends one bounded readiness probe ${parsed.viewerSignalProbeAfterMs} ms after active visible screen authorization.`,
    "- Host acknowledgement is metadata-only and does not grant access.",
    "",
    "4. Browser on the viewer PC:",
    browserCommand,
    "- Wait for frame=ready before browser pointer control.",
    "- Click the visible Pointer Off/On control before browser pointer movement, wheel, or button input.",
    "",
    "Host controls:",
    "help | status | pause | resume | revoke screen:view | revoke input:pointer | revoke input:keyboard | terminate | disconnect",
    "",
    "Safety checks:",
    "- Keep all terminals visible while the session is active.",
    "- Run the preflight commands manually; this helper only prints them.",
    "- Stop from the host terminal with pause, revoke, terminate, disconnect, or Ctrl+C.",
    "- Do not share this generated output outside the trusted test session.",
    "- This helper printed commands only; it did not start relay, host, viewer, capture, input, or browser processes."
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function formatMvpSessionCommandsJson(parsed) {
  const preflightCommands = [
    { name: "preflight.ready", command: "npm run mvp:ready" },
    { name: "preflight.doctor", command: "npm run mvp:doctor" },
    { name: "preflight.native", command: "npm run mvp:native-preflight" },
    { name: "preflight.smoke", command: "npm run mvp:smoke" },
    { name: "preflight.ready-all-smoke", command: renderAllSmokePreflightCommand(parsed) }
  ];
  const safety = [
    "Host consent and visible sessions are required before live assistance trials.",
    "This helper prints commands only.",
    "Do not share generated output outside the trusted test session."
  ];

  if (parsed.preflightOnly) {
    return JSON.stringify({
      ok: true,
      mode: "preflight",
      nonExecuting: true,
      commands: preflightCommands,
      safety
    });
  }

  const browserCommand = renderBrowserCommandForViewerSurfacePort(parsed.viewerControlSurfacePort);
  return JSON.stringify({
    ok: true,
    mode: "session",
    nonExecuting: true,
    commands: [
      ...preflightCommands,
      { name: "relay", command: renderRelayCommand(parsed) },
      { name: "host", command: renderHostCommand(parsed) },
      { name: "viewer", command: renderViewerCommand(parsed) },
      { name: "browser", command: browserCommand }
    ],
    safety
  });
}

function renderMvpPreflightOnlyCommands(parsed = {}) {
  return [
    "# WinBridge MVP preflight commands",
    "",
    "Run each command manually in a visible PowerShell terminal before a two-PC MVP trial.",
    "",
    "0. Preflight before the two-PC trial:",
    "- On each Windows machine:",
    "npm run mvp:ready",
    "- Individual troubleshooting checks:",
    "npm run mvp:doctor",
    "npm run mvp:native-preflight",
    "- On one local development machine before the two-PC trial:",
    "npm run mvp:smoke",
    "- Full local smoke coverage before the two-PC trial:",
    ...renderAllSmokePreflightLines(parsed),
    "",
    "Safety checks:",
    "- Host consent and visible sessions are required before any live assistance trial.",
    "- Do not proceed if any preflight command fails.",
    "- This helper printed commands only; it did not start runtime processes or remote assistance actions."
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function renderMvpFilteredCommandTarget(parsed) {
  if (parsed.onlyTarget === "preflight") {
    return renderMvpPreflightOnlyCommands(parsed);
  }

  const browserCommand = renderBrowserCommandForViewerSurfacePort(parsed.viewerControlSurfacePort);
  const commandByTarget = {
    relay: renderRelayCommand(parsed),
    host: renderHostCommand(parsed),
    viewer: renderViewerCommand(parsed),
    browser: browserCommand
  };
  const targetLabel = parsed.onlyTarget;

  return [
    `# WinBridge MVP ${targetLabel} command`,
    "",
    "Run this command manually in a visible PowerShell terminal.",
    roleScopedReadyReminderForTarget(parsed.onlyTarget),
    `Relay URL: ${parsed.relay}`,
    "",
    `${targetLabel} command:`,
    commandByTarget[targetLabel],
    "",
    ...filteredTargetHints(parsed.onlyTarget),
    "",
    "Safety checks:",
    "- Host consent and visible sessions are required before live assistance trials.",
    "- This helper printed commands only; it did not start relay, host, viewer, capture, input, or browser processes.",
    "- Stop from the host terminal with pause, revoke, terminate, disconnect, or Ctrl+C."
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function renderAllSmokePreflightLines(parsed) {
  if (parsed?.tokenEnv) {
    return [renderAllSmokePreflightCommand(parsed)];
  }

  return [
    "Set $env:WINBRIDGE_RELAY_SHARED_TOKEN, then run:",
    ALL_SMOKE_READY_COMMAND
  ];
}

function renderAllSmokePreflightCommand(parsed) {
  if (parsed?.tokenEnv) {
    return `$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:${parsed.tokenEnv}; ${ALL_SMOKE_READY_COMMAND}`;
  }

  return ALL_SMOKE_READY_COMMAND;
}

function roleScopedReadyReminderForTarget(target) {
  const role = target === "browser" ? "viewer" : target;
  return `Preflight reminder: run npm run mvp:ready -- --role ${role} on this machine before a live trial.`;
}

function filteredTargetHints(target) {
  switch (target) {
    case "relay":
      return ["Run the host and viewer commands on their respective Windows PCs after the relay is visible."];
    case "host":
      return [
        "Host controls:",
        "help | status | pause | resume | revoke screen:view | revoke input:pointer | revoke input:keyboard | terminate | disconnect"
      ];
    case "viewer":
      return ["Open the separate browser command on the viewer PC after this viewer command is running."];
    case "browser":
      return [
        "Open only on the viewer PC after the viewer command reports the local control surface URL.",
        "- Wait for frame=ready before browser pointer control.",
        "- Click the visible Pointer Off/On control before browser pointer movement, wheel, or button input."
      ];
    default:
      return [];
  }
}

export function formatMvpSessionCommandKitError(error) {
  if (error instanceof MvpSessionCommandKitUsageError) {
    return MVP_SESSION_COMMAND_KIT_USAGE;
  }

  return "WinBridge MVP command kit failed.";
}

function parseCommandKitFlags(rawArgs) {
  let json = false;
  let preflightOnly = false;
  let generatePairing = false;
  let onlyTarget;
  const remaining = [];

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--json") {
      if (json) {
        throw new MvpSessionCommandKitUsageError();
      }
      json = true;
      continue;
    }

    if (arg === "--preflight-only") {
      if (preflightOnly) {
        throw new MvpSessionCommandKitUsageError();
      }
      preflightOnly = true;
      continue;
    }

    if (arg === "--generate-pairing") {
      if (generatePairing) {
        throw new MvpSessionCommandKitUsageError();
      }
      generatePairing = true;
      continue;
    }

    if (arg === "--only") {
      if (onlyTarget) {
        throw new MvpSessionCommandKitUsageError();
      }
      const target = rawArgs[index + 1];
      if (!COMMAND_ONLY_TARGETS.has(target)) {
        throw new MvpSessionCommandKitUsageError();
      }
      onlyTarget = target;
      index += 1;
      continue;
    }

    remaining.push(arg);
  }

  return { json, preflightOnly, generatePairing, onlyTarget, remaining };
}

function generatePairingCode() {
  return `${formatPairingPart(randomInt(0, 1000))}-${formatPairingPart(randomInt(0, 1000))}`;
}

function formatPairingPart(value) {
  return String(value).padStart(3, "0");
}

function renderRelayCommand(options) {
  const command = renderRelayBaseCommand(options);
  const prefixes = [];

  if (shouldBindRelayForLan(options.relay)) {
    prefixes.push("$env:WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'");
  }

  const relayPort = relayEffectivePort(options.relay);
  if (relayPort !== 8787) {
    prefixes.push(`$env:WINBRIDGE_RELAY_PORT = '${relayPort}'`);
  }

  return prefixes.length === 0 ? command : `${prefixes.join("; ")}; ${command}`;
}

function renderRelayBaseCommand(options) {
  if (!options.tokenEnv) {
    return "npm run dev:relay";
  }

  if (options.tokenEnv === "WINBRIDGE_RELAY_SHARED_TOKEN") {
    return "npm run dev:relay";
  }

  return `$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:${options.tokenEnv}; npm run dev:relay`;
}

function shouldBindRelayForLan(relayUrl) {
  const { hostname } = new URL(relayUrl);
  return !["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname.toLowerCase());
}

function relayEffectivePort(relayUrl) {
  const parsed = new URL(relayUrl);
  if (parsed.port) {
    return Number.parseInt(parsed.port, 10);
  }
  return parsed.protocol === "wss:" ? 443 : 80;
}

function renderHostCommand(options) {
  return renderAgentCommand("host", [
    ["relay", options.relay],
    ["session", options.session],
    ["pairing", options.pairing],
    ["name", options.hostName],
    ["host-consent-prompt", "true"],
    ["visible-session", "true"],
    ["host-control-prompt", "true"],
    ["host-signal-probe-ack", "true"],
    ["audit-log", options.hostAuditLog],
    ["host-apply-input", "true"],
    ["dev-screen-frame-after-ms", String(options.captureAfterMs)],
    ["dev-screen-frame-source", "windows-capture"],
    ["dev-screen-frame-count", String(options.captureCount)],
    ["dev-screen-frame-interval-ms", String(options.captureIntervalMs)]
  ], options.tokenEnv);
}

function renderViewerCommand(options) {
  return renderAgentCommand("viewer", [
    ["relay", options.relay],
    ["session", options.session],
    ["pairing", options.pairing],
    ["name", options.viewerName],
    ["request", "screen:view,input:pointer,input:keyboard"],
    ["request-reason", options.requestReason],
    ["viewer-signal-probe-after-ms", String(options.viewerSignalProbeAfterMs)],
    ["audit-log", options.viewerAuditLog],
    ["viewer-screen-frame-output", options.viewerFrameOutput],
    ["viewer-control-surface-port", String(options.viewerControlSurfacePort)]
  ], options.tokenEnv);
}

function renderAgentCommand(role, optionPairs, tokenEnv) {
  const tokens = ["npm", "run", "dev:agent", "--", role];

  for (const [name, value] of optionPairs) {
    tokens.push(`--${name}`, quotePowerShellArgument(value));
  }

  if (tokenEnv) {
    tokens.push("--token", `$env:${tokenEnv}`);
  }

  return tokens.join(" ");
}

function renderBrowserCommand(browserUrl) {
  return `Start-Process ${quotePowerShellArgument(browserUrl)}`;
}

function renderBrowserCommandForViewerSurfacePort(port) {
  if (port === 0) {
    return EPHEMERAL_VIEWER_SURFACE_BROWSER_INSTRUCTION;
  }

  return renderBrowserCommand(`http://127.0.0.1:${port}/`);
}

function parseOptionMap(rawArgs) {
  if (rawArgs.length % 2 !== 0) {
    throw new MvpSessionCommandKitUsageError();
  }

  const options = new Map();
  for (let index = 0; index < rawArgs.length; index += 2) {
    const key = rawArgs[index];
    const value = rawArgs[index + 1];

    if (!key?.startsWith("--") || value === undefined || value.startsWith("--")) {
      throw new MvpSessionCommandKitUsageError();
    }

    const optionName = key.slice(2);
    if (TOKEN_OPTION_NAMES.has(optionName) || !KNOWN_OPTIONS.has(optionName) || options.has(optionName)) {
      throw new MvpSessionCommandKitUsageError();
    }

    options.set(optionName, value);
  }

  return options;
}

function parsePreflightSelectorTokenEnv(rawArgs) {
  const options = parseOptionMap(rawArgs);
  if (options.size > 1 || (options.size === 1 && !options.has("token-env"))) {
    throw new MvpSessionCommandKitUsageError();
  }

  return parseOptionalTokenEnv(options.get("token-env"));
}

function parseProtocolIdentifier(raw) {
  if (
    typeof raw !== "string" ||
    !PROTOCOL_IDENTIFIER_PATTERN.test(raw) ||
    hasUnsafeScalarCharacters(raw) ||
    hasSecretBearingMetadata(raw)
  ) {
    throw new MvpSessionCommandKitUsageError();
  }

  return raw;
}

function parsePairingCode(raw) {
  if (typeof raw !== "string" || !PAIRING_CODE_PATTERN.test(raw)) {
    throw new MvpSessionCommandKitUsageError();
  }

  return raw;
}

function parseDisplayName(raw) {
  if (
    isUnsafeScalar(raw) ||
    raw.length > SAFE_DISPLAY_NAME_MAX_LENGTH ||
    hasSecretBearingMetadata(raw)
  ) {
    throw new MvpSessionCommandKitUsageError();
  }

  return raw;
}

function parseRequestReason(raw) {
  if (
    isUnsafeScalar(raw) ||
    raw.length > SAFE_REASON_MAX_LENGTH ||
    hasSecretBearingMetadata(raw)
  ) {
    throw new MvpSessionCommandKitUsageError();
  }

  return raw;
}

function parseRelayHostShortcut(raw) {
  if (
    isUnsafeScalar(raw) ||
    !RELAY_HOST_SHORTCUT_PATTERN.test(raw) ||
    hasSecretBearingMetadata(raw) ||
    isLoopbackOrUnspecifiedRelayHost(raw)
  ) {
    throw new MvpSessionCommandKitUsageError();
  }

  if (IPV4_LITERAL_PATTERN.test(raw)) {
    const parts = raw.split(".").map((part) => Number.parseInt(part, 10));
    if (parts.some((part) => part > 255)) {
      throw new MvpSessionCommandKitUsageError();
    }
  }

  return raw;
}

function parseCaptureDurationMinutes(raw) {
  if (raw === undefined) {
    return undefined;
  }

  return parseIntegerOption(raw, 1, MAX_CAPTURE_DURATION_MINUTES);
}

function resolveCaptureCount(rawCount, durationMinutes, captureIntervalMs) {
  if (rawCount !== undefined) {
    return parseIntegerOption(rawCount, 1, MAX_CAPTURE_FRAME_COUNT);
  }

  if (durationMinutes === undefined) {
    return DEFAULT_MVP_SESSION_COMMAND_OPTIONS.captureCount;
  }

  const count = Math.ceil((durationMinutes * 60_000) / captureIntervalMs);
  if (count < 1 || count > MAX_CAPTURE_FRAME_COUNT) {
    throw new MvpSessionCommandKitUsageError();
  }

  return count;
}

function buildRelayUrlFromHostShortcut(host) {
  return parseRelayUrl(`ws://${host}:8787/`);
}

function parseRelayUrl(raw) {
  if (isUnsafeScalar(raw)) {
    throw new MvpSessionCommandKitUsageError();
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new MvpSessionCommandKitUsageError();
  }

  if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
    throw new MvpSessionCommandKitUsageError();
  }

  if (parsed.username || parsed.password || relayUrlHasUserInfoMarker(raw)) {
    throw new MvpSessionCommandKitUsageError();
  }

  if (parsed.search || parsed.hash || relayUrlHasTokenQueryParameter(parsed)) {
    throw new MvpSessionCommandKitUsageError();
  }

  if (isUnspecifiedRelayConnectHost(parsed.hostname) || parsed.pathname !== "/") {
    throw new MvpSessionCommandKitUsageError();
  }

  return parsed.toString();
}

function isUnspecifiedRelayConnectHost(hostname) {
  const host = hostname.toLowerCase();
  return host === "0.0.0.0" || host === "::" || host === "[::]";
}

function isLoopbackOrUnspecifiedRelayHost(raw) {
  const host = raw.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host === "0.0.0.0") {
    return true;
  }

  if (IPV4_LITERAL_PATTERN.test(host)) {
    const [first] = host.split(".");
    return first === "127";
  }

  return false;
}

function parseSafePath(raw) {
  if (
    isUnsafeScalar(raw) ||
    raw.length > SAFE_PATH_MAX_LENGTH ||
    raw.startsWith("\\\\") ||
    raw.endsWith("\\") ||
    raw.endsWith("/") ||
    hasUnsafeWindowsPathCharacter(raw) ||
    hasUnsafeWindowsPathColon(raw) ||
    hasSecretBearingMetadata(raw)
  ) {
    throw new MvpSessionCommandKitUsageError();
  }

  const segments = raw.split(/[\\/]+/);
  if (
    segments.some(
      (segment) =>
        segment.length === 0 ||
        segment === "." ||
        segment === ".." ||
        WINDOWS_RESERVED_PATH_SEGMENT_PATTERN.test(segment)
    )
  ) {
    throw new MvpSessionCommandKitUsageError();
  }

  return raw;
}

function parseOptionalTokenEnv(raw) {
  if (raw === undefined) {
    return undefined;
  }

  if (isUnsafeScalar(raw) || !ENV_NAME_PATTERN.test(raw)) {
    throw new MvpSessionCommandKitUsageError();
  }

  return raw;
}

function parseIntegerOption(raw, min, max) {
  if (isUnsafeScalar(raw)) {
    throw new MvpSessionCommandKitUsageError();
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < min || value > max || String(value) !== raw) {
    throw new MvpSessionCommandKitUsageError();
  }

  return value;
}

function parseViewerControlSurfacePortOption(raw) {
  const port = parseIntegerOption(raw, 0, 65535);
  if (port !== 0 && port < 1024) {
    throw new MvpSessionCommandKitUsageError();
  }
  return port;
}

function relayUrlHasTokenQueryParameter(relayUrl) {
  for (const [name] of relayUrl.searchParams) {
    if (name.toLowerCase() === "token") {
      return true;
    }
  }

  return false;
}

function relayUrlHasUserInfoMarker(raw) {
  const authorityStart = raw.indexOf("://");
  if (authorityStart === -1) {
    return false;
  }

  const authorityRemainder = raw.slice(authorityStart + 3);
  const authorityEnd = authorityRemainder.search(/[/?#]/);
  const authority =
    authorityEnd === -1 ? authorityRemainder : authorityRemainder.slice(0, authorityEnd);

  return authority.includes("@");
}

function isUnsafeScalar(raw) {
  return (
    typeof raw !== "string" ||
    raw.trim().length === 0 ||
    raw !== raw.trim() ||
    hasUnsafeScalarCharacters(raw)
  );
}

function hasUnsafeScalarCharacters(raw) {
  return hasAsciiControlCharacter(raw) || hasUnsafeFormatCharacter(raw);
}

function hasAsciiControlCharacter(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127) {
      return true;
    }
  }

  return false;
}

function hasUnsafeFormatCharacter(value) {
  for (const character of value) {
    const codePoint = character.codePointAt(0);

    if (
      codePoint === 0x061c ||
      codePoint === 0x200b ||
      codePoint === 0x200c ||
      codePoint === 0x200d ||
      codePoint === 0x200e ||
      codePoint === 0x200f ||
      codePoint === 0x2060 ||
      codePoint === 0xfeff ||
      (codePoint !== undefined && codePoint >= 0x202a && codePoint <= 0x202e) ||
      (codePoint !== undefined && codePoint >= 0x2066 && codePoint <= 0x2069)
    ) {
      return true;
    }
  }

  return false;
}

function hasUnsafeWindowsPathCharacter(raw) {
  return /[<>"|?*]/.test(raw) || raw.includes("`") || raw.includes("$");
}

function hasUnsafeWindowsPathColon(raw) {
  const colonIndexes = [];
  for (let index = 0; index < raw.length; index += 1) {
    if (raw[index] === ":") {
      colonIndexes.push(index);
    }
  }

  if (colonIndexes.length === 0) {
    return false;
  }

  return !(
    colonIndexes.length === 1 &&
    colonIndexes[0] === 1 &&
    /^[A-Za-z]:[\\/]/.test(raw)
  );
}

function hasSecretBearingMetadata(raw) {
  return SECRET_MARKER_PATTERN.test(raw);
}

function quotePowerShellArgument(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function runCli(rawArgs = process.argv.slice(2), streams = process) {
  try {
    const parsed = parseMvpSessionCommandArgs(rawArgs);
    streams.stdout.write(`${renderMvpSessionCommands(parsed)}\n`);
    return 0;
  } catch (error) {
    streams.stderr.write(`${formatMvpSessionCommandKitError(error)}\n`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = runCli();
}
