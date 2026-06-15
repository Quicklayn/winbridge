import { assertAuditLogPath } from "@winbridge/audit-log";
import {
  createMessageBase,
  DeviceIdentitySchema,
  hasSecretBearingAuditMetadata,
  hasSecretBearingProtocolIdentifierMetadata,
  PairingCodeSchema,
  PeerIdSchema,
  PermissionSchema,
  parseProtocolEnvelope,
  ProtocolIdentifierSchema,
  SessionIdSchema,
  type Permission,
  type ProtocolEnvelope,
  type SessionRole
} from "@winbridge/protocol";
import {
  MAX_AGENT_SHELL_DISCONNECT_REASON_BYTES,
  MAX_AGENT_SHELL_REASON_LENGTH,
  MAX_AGENT_SHELL_TOKEN_BYTES,
  MAX_AGENT_SHELL_TIMER_DELAY_MS,
  parsePermissions,
  type AgentShellInputEventInput,
  type AgentShellScreenFrameInput,
  type HostDecision
} from "./runtime.js";

export type AgentShellDevScreenFrameArgs = Readonly<{
  afterMs: number;
  frame: Omit<AgentShellScreenFrameInput, "authorizationId">;
  stream?: {
    count: number;
    intervalMs: number;
  };
}>;

export type AgentShellDevInputEventArgs = Readonly<{
  afterMs: number;
  input: Omit<AgentShellInputEventInput, "authorizationId">;
}>;

export type AgentShellArgs = {
  role: SessionRole;
  relayUrl: string;
  sessionId: string;
  pairingCode: string;
  peerId: string;
  displayName: string;
  token?: string;
  deviceId: string;
  auditLogPath?: string;
  requestedPermissions: ReturnType<typeof parsePermissions>;
  requestReason?: string;
  hostGrantPermissions?: ReturnType<typeof parsePermissions>;
  hostDecision: HostDecision;
  hostConsentPrompt: boolean;
  hostControlPrompt: boolean;
  hostStatusAfterMs?: number;
  viewerControlPrompt: boolean;
  hostSignalProbeAck?: boolean;
  hostConsentTimeoutMs?: number;
  visibleToHost: boolean;
  authorizationTtlMs?: number;
  hostRevokeAfterMs?: number;
  hostRevokePermission?: Permission;
  hostRevokeReason?: string;
  hostPauseAfterMs?: number;
  hostPauseReason?: string;
  hostResumeAfterMs?: number;
  hostResumeReason?: string;
  hostTerminateAfterMs?: number;
  hostTerminateReason?: string;
  hostDisconnectAfterMs?: number;
  hostDisconnectReason?: string;
  viewerSignalProbeAfterMs?: number;
  viewerStatusAfterMs?: number;
  viewerDisconnectAfterMs?: number;
  devScreenFrame?: AgentShellDevScreenFrameArgs;
  devInputEvent?: AgentShellDevInputEventArgs;
};

export const AGENT_SHELL_USAGE =
  "Usage: npm run dev:agent -- <host|viewer> [--relay ws://localhost:8787] [--session demo] [--pairing 123-456] [--peer peer-id] [--device device-id] [--name display-name] [--token token] [--audit-log logs\\agent-audit.jsonl] [--request screen:view,input:pointer] [--request-reason reason] [--grant screen:view,input:pointer] [--host-decision none|approve|deny] [--host-consent-prompt true|false] [--host-control-prompt true|false] [--host-status-after-ms 1000] [--viewer-control-prompt true|false] [--host-signal-probe-ack true|false] [--host-consent-timeout-ms 60000] [--visible-session true|false] [--authorization-ttl-ms 600000] [--revoke-after-ms 1000] [--revoke-permission screen:view] [--revoke-reason reason] [--pause-after-ms 1000] [--pause-reason reason] [--resume-after-ms 1000] [--resume-reason reason] [--terminate-after-ms 1000] [--terminate-reason reason] [--disconnect-after-ms 1000] [--disconnect-reason reason] [--viewer-signal-probe-after-ms 1000] [--viewer-status-after-ms 1000] [--viewer-disconnect-after-ms 1000] [--dev-screen-frame-after-ms 1000] [--dev-screen-frame-id frame_cli_1] [--dev-screen-frame-format image/png] [--dev-screen-frame-width 1] [--dev-screen-frame-height 1] [--dev-screen-frame-data-base64 base64] [--dev-screen-frame-count 3] [--dev-screen-frame-interval-ms 1000] [--dev-input-after-ms 1000] [--dev-input-kind pointer-move|pointer-down|pointer-up|pointer-wheel|key-down|key-up] [--dev-input-event-id input_cli_1] [--dev-pointer-x 0.5] [--dev-pointer-y 0.5] [--dev-pointer-button primary] [--dev-pointer-buttons 1] [--dev-pointer-delta-x 0] [--dev-pointer-delta-y 1] [--dev-key KeyA] [--dev-code KeyA] [--dev-modifiers shift,control]";

const DEFAULT_DEV_SCREEN_FRAME_DATA_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
const DEFAULT_DEV_SCREEN_FRAME_ID = "frame_cli_1";
const MAX_DEV_SCREEN_FRAME_STREAM_COUNT = 1000;
const DEFAULT_DEV_INPUT_EVENT_ID = "input_cli_1";
const DEV_CLI_VALIDATION_AUTHORIZATION_ID = "authz_cli_validation";
const DEV_CLI_VALIDATION_FROM_PEER_ID = "peer-cli-validation";
const REMOTE_INPUT_MODIFIERS = ["alt", "control", "meta", "shift"] as const;
type RemoteInputModifier = (typeof REMOTE_INPUT_MODIFIERS)[number];
type RemoteInputKind = Extract<ProtocolEnvelope, { type: "input-event" }>["event"]["kind"];
type RemoteKeyboardKey = Extract<
  AgentShellInputEventInput["event"],
  { kind: "key-down" | "key-up" }
>["key"];

const knownOptions = new Set([
  "relay",
  "session",
  "pairing",
  "peer",
  "device",
  "name",
  "token",
  "audit-log",
  "request",
  "request-reason",
  "grant",
  "host-decision",
  "host-consent-prompt",
  "host-control-prompt",
  "host-status-after-ms",
  "viewer-control-prompt",
  "host-signal-probe-ack",
  "host-consent-timeout-ms",
  "visible-session",
  "authorization-ttl-ms",
  "revoke-after-ms",
  "revoke-permission",
  "revoke-reason",
  "pause-after-ms",
  "pause-reason",
  "resume-after-ms",
  "resume-reason",
  "terminate-after-ms",
  "terminate-reason",
  "disconnect-after-ms",
  "disconnect-reason",
  "viewer-signal-probe-after-ms",
  "viewer-status-after-ms",
  "viewer-disconnect-after-ms",
  "dev-screen-frame-after-ms",
  "dev-screen-frame-id",
  "dev-screen-frame-format",
  "dev-screen-frame-width",
  "dev-screen-frame-height",
  "dev-screen-frame-data-base64",
  "dev-screen-frame-count",
  "dev-screen-frame-interval-ms",
  "dev-input-after-ms",
  "dev-input-kind",
  "dev-input-event-id",
  "dev-pointer-x",
  "dev-pointer-y",
  "dev-pointer-button",
  "dev-pointer-buttons",
  "dev-pointer-delta-x",
  "dev-pointer-delta-y",
  "dev-key",
  "dev-code",
  "dev-modifiers"
]);

const hostRejectedViewerWorkflowOptions = [
  "request",
  "request-reason",
  "dev-input-after-ms",
  "dev-input-kind",
  "dev-input-event-id",
  "dev-pointer-x",
  "dev-pointer-y",
  "dev-pointer-button",
  "dev-pointer-buttons",
  "dev-pointer-delta-x",
  "dev-pointer-delta-y",
  "dev-key",
  "dev-code",
  "dev-modifiers"
] as const;

const viewerRejectedHostWorkflowOptions = [
  "grant",
  "host-decision",
  "host-consent-prompt",
  "host-consent-timeout-ms",
  "host-control-prompt",
  "host-status-after-ms",
  "host-signal-probe-ack",
  "visible-session",
  "authorization-ttl-ms",
  "revoke-after-ms",
  "revoke-permission",
  "revoke-reason",
  "pause-after-ms",
  "pause-reason",
  "resume-after-ms",
  "resume-reason",
  "terminate-after-ms",
  "terminate-reason",
  "disconnect-after-ms",
  "disconnect-reason",
  "dev-screen-frame-after-ms",
  "dev-screen-frame-id",
  "dev-screen-frame-format",
  "dev-screen-frame-width",
  "dev-screen-frame-height",
  "dev-screen-frame-data-base64",
  "dev-screen-frame-count",
  "dev-screen-frame-interval-ms"
] as const;

const devScreenFrameOptions = [
  "dev-screen-frame-after-ms",
  "dev-screen-frame-id",
  "dev-screen-frame-format",
  "dev-screen-frame-width",
  "dev-screen-frame-height",
  "dev-screen-frame-data-base64",
  "dev-screen-frame-count",
  "dev-screen-frame-interval-ms"
] as const;

const devInputEventOptions = [
  "dev-input-after-ms",
  "dev-input-kind",
  "dev-input-event-id",
  "dev-pointer-x",
  "dev-pointer-y",
  "dev-pointer-button",
  "dev-pointer-buttons",
  "dev-pointer-delta-x",
  "dev-pointer-delta-y",
  "dev-key",
  "dev-code",
  "dev-modifiers"
] as const;

const devPointerOptions = [
  "dev-pointer-x",
  "dev-pointer-y",
  "dev-pointer-button",
  "dev-pointer-buttons",
  "dev-pointer-delta-x",
  "dev-pointer-delta-y"
] as const;

const devKeyboardOptions = ["dev-key", "dev-code", "dev-modifiers"] as const;

export class AgentShellUsageError extends Error {
  constructor() {
    super(AGENT_SHELL_USAGE);
    this.name = "AgentShellUsageError";
  }
}

export function parseArgs(
  raw: string[],
  env: NodeJS.ProcessEnv = process.env,
  processId = process.pid
): AgentShellArgs {
  const role = raw[0] as SessionRole | undefined;

  if (role !== "host" && role !== "viewer") {
    throw new AgentShellUsageError();
  }

  const options = parseOptionMap(raw.slice(1));
  assertNoHostViewerWorkflowOptions(role, options);
  assertNoViewerHostWorkflowOptions(role, options);
  const sessionId = parseSessionId(options.get("session") ?? "demo");
  const pairingCode = parsePairingCode(options.get("pairing") ?? "123-456");
  const peerId = parsePeerId(options.get("peer") ?? `${role}-${processId}`);

  const hostDecision = parseHostDecision(options.get("host-decision"));
  const hostConsentPrompt = parseHostConsentPrompt(role, hostDecision, options.get("host-consent-prompt"));
  const hostStatusAfterMs = parseHostStatusAfterMs(role, options.get("host-status-after-ms"));
  const hostControlPrompt = parseHostControlPrompt(
    role,
    hostConsentPrompt,
    hostStatusAfterMs,
    options.get("host-control-prompt")
  );
  const hostSignalProbeAck = parseHostSignalProbeAck(role, options.get("host-signal-probe-ack"));
  const hostGrantPermissions = parseHostGrantPermissions(
    role,
    hostDecision,
    hostConsentPrompt,
    options.get("grant")
  );
  const requestedPermissions = parseRequestedPermissions(options.get("request"));
  const requestReason = parseRequestReason(
    role,
    requestedPermissions,
    options.get("request-reason")
  );
  const viewerSignalProbeAfterMs = parseViewerSignalProbeAfterMs(
    role,
    requestedPermissions,
    options.get("viewer-signal-probe-after-ms")
  );
  const viewerStatusAfterMs = parseViewerStatusAfterMs(
    role,
    options.get("viewer-status-after-ms")
  );
  const viewerDisconnectAfterMs = parseViewerDisconnectAfterMs(
    role,
    options.get("viewer-disconnect-after-ms")
  );
  const viewerControlPrompt = parseViewerControlPrompt(
    role,
    viewerStatusAfterMs,
    viewerDisconnectAfterMs,
    options.get("viewer-control-prompt")
  );
  const devScreenFrame = parseDevScreenFrame(role, options);
  const devInputEvent = parseDevInputEvent(role, requestedPermissions, options);

  return {
    role,
    relayUrl: parseRelayUrl(options.get("relay") ?? "ws://localhost:8787"),
    sessionId,
    pairingCode,
    peerId,
    displayName: parseDisplayName(options.get("name") ?? `${role} ${processId}`),
    token: parseOptionalToken(options.get("token")),
    deviceId: parseDeviceId(options.get("device") ?? `dev_${role}_${processId}`),
    auditLogPath: parseOptionalAuditLogPath(
      options.get("audit-log") ?? env.WINBRIDGE_AGENT_AUDIT_LOG_PATH
    ),
    requestedPermissions,
    requestReason,
    hostGrantPermissions,
    hostDecision,
    hostConsentPrompt,
    hostControlPrompt,
    hostStatusAfterMs,
    viewerControlPrompt,
    hostSignalProbeAck,
    hostConsentTimeoutMs: parseHostConsentTimeoutMs(
      hostConsentPrompt,
      options.get("host-consent-timeout-ms")
    ),
    visibleToHost: parseVisibleSession(options.get("visible-session")),
    authorizationTtlMs: parseOptionalAuthorizationTtlMs(options.get("authorization-ttl-ms")),
    hostRevokeAfterMs: parseOptionalTimerDelayMs(options.get("revoke-after-ms")),
    hostRevokePermission: parseOptionalPermission(options.get("revoke-permission")),
    hostRevokeReason: parseOptionalReason(options.get("revoke-reason")),
    hostPauseAfterMs: parseOptionalTimerDelayMs(options.get("pause-after-ms")),
    hostPauseReason: parseOptionalReason(options.get("pause-reason")),
    hostResumeAfterMs: parseOptionalTimerDelayMs(options.get("resume-after-ms")),
    hostResumeReason: parseOptionalReason(options.get("resume-reason")),
    hostTerminateAfterMs: parseOptionalTimerDelayMs(options.get("terminate-after-ms")),
    hostTerminateReason: parseOptionalReason(options.get("terminate-reason")),
    hostDisconnectAfterMs: parseOptionalTimerDelayMs(options.get("disconnect-after-ms")),
    hostDisconnectReason: parseHostDisconnectReason(role, options.get("disconnect-reason")),
    viewerSignalProbeAfterMs,
    viewerStatusAfterMs,
    viewerDisconnectAfterMs,
    devScreenFrame,
    devInputEvent
  };
}

function assertNoHostViewerWorkflowOptions(role: SessionRole, options: Map<string, string>): void {
  if (role !== "host") {
    return;
  }

  for (const optionName of hostRejectedViewerWorkflowOptions) {
    if (options.has(optionName)) {
      throw new AgentShellUsageError();
    }
  }
}

function assertNoViewerHostWorkflowOptions(role: SessionRole, options: Map<string, string>): void {
  if (role !== "viewer") {
    return;
  }

  for (const optionName of viewerRejectedHostWorkflowOptions) {
    if (options.has(optionName)) {
      throw new AgentShellUsageError();
    }
  }
}

function parseOptionMap(rawOptions: string[]): Map<string, string> {
  const options = new Map<string, string>();

  for (let index = 0; index < rawOptions.length; index += 2) {
    const key = rawOptions[index];
    const value = rawOptions[index + 1];

    if (!key?.startsWith("--") || !value || value.startsWith("--")) {
      throw new AgentShellUsageError();
    }

    const optionName = key.slice(2);
    if (!knownOptions.has(optionName) || options.has(optionName)) {
      throw new AgentShellUsageError();
    }

    options.set(optionName, value);
  }

  return options;
}

function parseRelayUrl(raw: string): string {
  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    throw new AgentShellUsageError();
  }

  if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
    throw new AgentShellUsageError();
  }

  if (parsed.username || parsed.password || relayUrlHasUserInfoMarker(raw)) {
    throw new AgentShellUsageError();
  }

  if (relayUrlHasTokenQueryParameter(parsed)) {
    throw new AgentShellUsageError();
  }

  return parsed.toString();
}

function relayUrlHasTokenQueryParameter(relayUrl: URL): boolean {
  for (const [name] of relayUrl.searchParams) {
    if (name.toLowerCase() === "token") {
      return true;
    }
  }

  return false;
}

function relayUrlHasUserInfoMarker(raw: string): boolean {
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

function parseSessionId(raw: string): string {
  try {
    const sessionId = SessionIdSchema.parse(raw);
    assertNoSecretBearingProtocolIdentifierMetadata(sessionId);

    return sessionId;
  } catch {
    throw new AgentShellUsageError();
  }
}

function parsePeerId(raw: string): string {
  try {
    const peerId = PeerIdSchema.parse(raw);
    assertNoSecretBearingProtocolIdentifierMetadata(peerId);

    return peerId;
  } catch {
    throw new AgentShellUsageError();
  }
}

function parseDeviceId(raw: string): string {
  try {
    const deviceId = ProtocolIdentifierSchema.min(8).parse(raw);
    assertNoSecretBearingProtocolIdentifierMetadata(deviceId);

    return deviceId;
  } catch {
    throw new AgentShellUsageError();
  }
}

function assertNoSecretBearingProtocolIdentifierMetadata(identifier: string): void {
  if (hasSecretBearingProtocolIdentifierMetadata(identifier)) {
    throw new Error("Protocol identifier must not contain secret-bearing metadata");
  }
}

function parsePairingCode(raw: string): string {
  try {
    return PairingCodeSchema.parse(raw);
  } catch {
    throw new AgentShellUsageError();
  }
}

function parseDisplayName(raw: string): string {
  if (raw.trim().length === 0) {
    throw new AgentShellUsageError();
  }

  try {
    return DeviceIdentitySchema.shape.displayName.parse(raw);
  } catch {
    throw new AgentShellUsageError();
  }
}

function parseRequestedPermissions(raw: string | undefined): Permission[] {
  try {
    return parsePermissions(raw);
  } catch {
    throw new AgentShellUsageError();
  }
}

function parseHostGrantPermissions(
  role: SessionRole,
  hostDecision: HostDecision,
  hostConsentPrompt: boolean,
  raw: string | undefined
): Permission[] | undefined {
  if (raw === undefined) {
    return undefined;
  }

  if (role !== "host" || (hostDecision !== "approve" && !hostConsentPrompt)) {
    throw new AgentShellUsageError();
  }

  try {
    const permissions = parsePermissions(raw);
    if (permissions.length === 0) {
      throw new AgentShellUsageError();
    }

    return permissions;
  } catch {
    throw new AgentShellUsageError();
  }
}

function parseHostDecision(raw: string | undefined): HostDecision {
  if (!raw) {
    return "none";
  }

  if (raw === "approve" || raw === "deny" || raw === "none") {
    return raw;
  }

  throw new AgentShellUsageError();
}

function parseVisibleSession(raw: string | undefined): boolean {
  if (raw === undefined) {
    return false;
  }

  if (raw === "true") {
    return true;
  }

  if (raw === "false") {
    return false;
  }

  throw new AgentShellUsageError();
}

function parseHostConsentPrompt(
  role: SessionRole,
  hostDecision: HostDecision,
  raw: string | undefined
): boolean {
  const enabled = parseBooleanFlag(raw, false);

  if (enabled && (role !== "host" || hostDecision === "approve" || hostDecision === "deny")) {
    throw new AgentShellUsageError();
  }

  return enabled;
}

function parseHostControlPrompt(
  role: SessionRole,
  hostConsentPrompt: boolean,
  hostStatusAfterMs: number | undefined,
  raw: string | undefined
): boolean {
  const enabled = parseBooleanFlag(raw, false);

  if (raw !== undefined && role !== "host") {
    throw new AgentShellUsageError();
  }

  if (enabled && hostConsentPrompt) {
    throw new AgentShellUsageError();
  }

  if (enabled && hostStatusAfterMs !== undefined) {
    throw new AgentShellUsageError();
  }

  return enabled;
}

function parseHostStatusAfterMs(role: SessionRole, raw: string | undefined): number | undefined {
  const delayMs = parseOptionalTimerDelayMs(raw);
  if (delayMs === undefined) {
    return undefined;
  }

  if (role !== "host") {
    throw new AgentShellUsageError();
  }

  return delayMs;
}

function parseViewerControlPrompt(
  role: SessionRole,
  viewerStatusAfterMs: number | undefined,
  viewerDisconnectAfterMs: number | undefined,
  raw: string | undefined
): boolean {
  const enabled = parseBooleanFlag(raw, false);

  if (raw !== undefined && role !== "viewer") {
    throw new AgentShellUsageError();
  }

  if (enabled && (viewerStatusAfterMs !== undefined || viewerDisconnectAfterMs !== undefined)) {
    throw new AgentShellUsageError();
  }

  return enabled;
}

function parseHostSignalProbeAck(role: SessionRole, raw: string | undefined): boolean | undefined {
  if (raw === undefined && role !== "host") {
    return undefined;
  }

  const enabled = parseBooleanFlag(raw, false);

  if (raw !== undefined && role !== "host") {
    throw new AgentShellUsageError();
  }

  return enabled;
}

function parseHostConsentTimeoutMs(
  hostConsentPrompt: boolean,
  raw: string | undefined
): number | undefined {
  if (raw === undefined) {
    return undefined;
  }

  if (!hostConsentPrompt) {
    throw new AgentShellUsageError();
  }

  const value = Number.parseInt(raw, 10);

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_AGENT_SHELL_TIMER_DELAY_MS ||
    String(value) !== raw
  ) {
    throw new AgentShellUsageError();
  }

  return value;
}

function parseViewerSignalProbeAfterMs(
  role: SessionRole,
  requestedPermissions: Permission[],
  raw: string | undefined
): number | undefined {
  const delayMs = parseOptionalTimerDelayMs(raw);
  if (delayMs === undefined) {
    return undefined;
  }

  if (role !== "viewer" || !requestedPermissions.includes("screen:view")) {
    throw new AgentShellUsageError();
  }

  return delayMs;
}

function parseRequestReason(
  role: SessionRole,
  requestedPermissions: Permission[],
  raw: string | undefined
): string | undefined {
  const reason = parseOptionalReason(raw);
  if (reason === undefined) {
    return undefined;
  }

  if (role !== "viewer" || requestedPermissions.length === 0) {
    throw new AgentShellUsageError();
  }

  return reason;
}

function parseViewerStatusAfterMs(role: SessionRole, raw: string | undefined): number | undefined {
  const delayMs = parseOptionalTimerDelayMs(raw);
  if (delayMs === undefined) {
    return undefined;
  }

  if (role !== "viewer") {
    throw new AgentShellUsageError();
  }

  return delayMs;
}

function parseViewerDisconnectAfterMs(
  role: SessionRole,
  raw: string | undefined
): number | undefined {
  const delayMs = parseOptionalTimerDelayMs(raw);
  if (delayMs === undefined) {
    return undefined;
  }

  if (role !== "viewer") {
    throw new AgentShellUsageError();
  }

  return delayMs;
}

function parseDevScreenFrame(
  role: SessionRole,
  options: Map<string, string>
): AgentShellDevScreenFrameArgs | undefined {
  if (!hasAnyOption(options, devScreenFrameOptions)) {
    return undefined;
  }

  if (role !== "host") {
    throw new AgentShellUsageError();
  }

  const afterMs = parseRequiredTimerDelayMs(options.get("dev-screen-frame-after-ms"));
  const frame = validateDevScreenFrame({
    frameId: parseRemoteInteractionId(options.get("dev-screen-frame-id") ?? DEFAULT_DEV_SCREEN_FRAME_ID),
    sequence: 0,
    format: parseDevScreenFrameFormat(options.get("dev-screen-frame-format") ?? "image/png"),
    width: parseIntegerOption(options.get("dev-screen-frame-width") ?? "1", 1, 16_384),
    height: parseIntegerOption(options.get("dev-screen-frame-height") ?? "1", 1, 16_384),
    dataBase64: options.get("dev-screen-frame-data-base64") ?? DEFAULT_DEV_SCREEN_FRAME_DATA_BASE64
  });
  const stream = parseDevScreenFrameStream(frame.frameId, options);

  return {
    afterMs,
    frame,
    ...(stream ? { stream } : {})
  };
}

function parseDevScreenFrameStream(
  baseFrameId: string,
  options: Map<string, string>
): AgentShellDevScreenFrameArgs["stream"] | undefined {
  const rawCount = options.get("dev-screen-frame-count");
  const rawIntervalMs = options.get("dev-screen-frame-interval-ms");
  const count =
    rawCount === undefined
      ? 1
      : parseIntegerOption(rawCount, 1, MAX_DEV_SCREEN_FRAME_STREAM_COUNT);

  if (count === 1) {
    if (rawIntervalMs !== undefined) {
      throw new AgentShellUsageError();
    }

    return undefined;
  }

  if (rawIntervalMs === undefined) {
    throw new AgentShellUsageError();
  }

  const intervalMs = parseIntegerOption(rawIntervalMs, 1, MAX_AGENT_SHELL_TIMER_DELAY_MS);
  parseRemoteInteractionId(createDevScreenFrameStreamFrameId(baseFrameId, count - 1));

  return { count, intervalMs };
}

function createDevScreenFrameStreamFrameId(baseFrameId: string, sequenceOffset: number): string {
  return `${baseFrameId}_${sequenceOffset}`;
}

function parseDevInputEvent(
  role: SessionRole,
  requestedPermissions: Permission[],
  options: Map<string, string>
): AgentShellDevInputEventArgs | undefined {
  if (!hasAnyOption(options, devInputEventOptions)) {
    return undefined;
  }

  if (role !== "viewer") {
    throw new AgentShellUsageError();
  }

  const afterMs = parseRequiredTimerDelayMs(options.get("dev-input-after-ms"));
  const kind = parseDevInputKind(options.get("dev-input-kind"));
  const requiredPermission = devInputKindRequiredPermission(kind);
  if (!requestedPermissions.includes(requiredPermission)) {
    throw new AgentShellUsageError();
  }

  const input = validateDevInputEvent({
    eventId: parseRemoteInteractionId(options.get("dev-input-event-id") ?? DEFAULT_DEV_INPUT_EVENT_ID),
    sequence: 0,
    event: parseDevInputEventPayload(kind, options)
  });

  return { afterMs, input };
}

function parseDevInputEventPayload(
  kind: RemoteInputKind,
  options: Map<string, string>
): AgentShellInputEventInput["event"] {
  switch (kind) {
    case "pointer-move":
      assertNoOptions(options, [
        "dev-pointer-button",
        "dev-pointer-delta-x",
        "dev-pointer-delta-y",
        ...devKeyboardOptions
      ]);
      return {
        kind,
        x: parseRequiredPointerCoordinate(options.get("dev-pointer-x")),
        y: parseRequiredPointerCoordinate(options.get("dev-pointer-y")),
        ...(options.has("dev-pointer-buttons")
          ? { buttons: parseIntegerOption(options.get("dev-pointer-buttons") ?? "", 0, 31) }
          : {})
      };
    case "pointer-down":
    case "pointer-up":
      assertNoOptions(options, [
        "dev-pointer-delta-x",
        "dev-pointer-delta-y",
        ...devKeyboardOptions
      ]);
      return {
        kind,
        x: parseRequiredPointerCoordinate(options.get("dev-pointer-x")),
        y: parseRequiredPointerCoordinate(options.get("dev-pointer-y")),
        button: parsePointerButton(options.get("dev-pointer-button")),
        ...(options.has("dev-pointer-buttons")
          ? { buttons: parseIntegerOption(options.get("dev-pointer-buttons") ?? "", 0, 31) }
          : {})
      };
    case "pointer-wheel":
      assertNoOptions(options, ["dev-pointer-button", "dev-pointer-buttons", ...devKeyboardOptions]);
      return {
        kind,
        x: parseRequiredPointerCoordinate(options.get("dev-pointer-x")),
        y: parseRequiredPointerCoordinate(options.get("dev-pointer-y")),
        deltaX: parseOptionalPointerDelta(options.get("dev-pointer-delta-x")),
        deltaY: parseOptionalPointerDelta(options.get("dev-pointer-delta-y"))
      };
    case "key-down":
    case "key-up":
      assertNoOptions(options, devPointerOptions);
      return {
        kind,
        key: parseRequiredKeyboardKey(options.get("dev-key")),
        ...(options.has("dev-code") ? { code: parseRequiredKeyboardKey(options.get("dev-code")) } : {}),
        modifiers: parseKeyboardModifiers(options.get("dev-modifiers"))
      };
  }
}

function validateDevScreenFrame(
  frame: AgentShellDevScreenFrameArgs["frame"]
): AgentShellDevScreenFrameArgs["frame"] {
  try {
    const parsed = parseProtocolEnvelope({
      ...createMessageBase("demo"),
      type: "screen-frame",
      authorizationId: DEV_CLI_VALIDATION_AUTHORIZATION_ID,
      fromPeerId: DEV_CLI_VALIDATION_FROM_PEER_ID,
      capturedAt: new Date(0).toISOString(),
      ...frame
    });

    if (parsed.type !== "screen-frame") {
      throw new AgentShellUsageError();
    }

    return frame;
  } catch {
    throw new AgentShellUsageError();
  }
}

function validateDevInputEvent(input: AgentShellDevInputEventArgs["input"]): AgentShellDevInputEventArgs["input"] {
  try {
    const parsed = parseProtocolEnvelope({
      ...createMessageBase("demo"),
      type: "input-event",
      authorizationId: DEV_CLI_VALIDATION_AUTHORIZATION_ID,
      fromPeerId: DEV_CLI_VALIDATION_FROM_PEER_ID,
      occurredAt: new Date(0).toISOString(),
      ...input
    });

    if (parsed.type !== "input-event") {
      throw new AgentShellUsageError();
    }

    return input;
  } catch {
    throw new AgentShellUsageError();
  }
}

function parseRequiredTimerDelayMs(raw: string | undefined): number {
  const delayMs = parseOptionalTimerDelayMs(raw);
  if (delayMs === undefined) {
    throw new AgentShellUsageError();
  }

  return delayMs;
}

function parseRemoteInteractionId(raw: string): string {
  try {
    const interactionId = ProtocolIdentifierSchema.parse(raw);
    assertNoSecretBearingProtocolIdentifierMetadata(interactionId);

    return interactionId;
  } catch {
    throw new AgentShellUsageError();
  }
}

function parseDevScreenFrameFormat(raw: string): AgentShellScreenFrameInput["format"] {
  if (raw === "image/png" || raw === "image/jpeg") {
    return raw;
  }

  throw new AgentShellUsageError();
}

function parseDevInputKind(raw: string | undefined): RemoteInputKind {
  switch (raw) {
    case "pointer-move":
    case "pointer-down":
    case "pointer-up":
    case "pointer-wheel":
    case "key-down":
    case "key-up":
      return raw;
    default:
      throw new AgentShellUsageError();
  }
}

function devInputKindRequiredPermission(kind: RemoteInputKind): Permission {
  switch (kind) {
    case "pointer-move":
    case "pointer-down":
    case "pointer-up":
    case "pointer-wheel":
      return "input:pointer";
    case "key-down":
    case "key-up":
      return "input:keyboard";
  }
}

function parseRequiredPointerCoordinate(raw: string | undefined): number {
  if (raw === undefined || isUnsafeCliScalar(raw)) {
    throw new AgentShellUsageError();
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 1 || String(value) !== raw) {
    throw new AgentShellUsageError();
  }

  return value;
}

function parsePointerButton(raw: string | undefined): AgentShellInputEventInput["event"] extends infer Event
  ? Event extends { button: infer Button }
    ? Button
    : never
  : never {
  switch (raw) {
    case "primary":
    case "secondary":
    case "middle":
    case "back":
    case "forward":
      return raw;
    default:
      throw new AgentShellUsageError();
  }
}

function parseOptionalPointerDelta(raw: string | undefined): number {
  if (raw === undefined) {
    return 0;
  }

  return parseIntegerOption(raw, -4096, 4096);
}

function parseRequiredKeyboardKey(raw: string | undefined): RemoteKeyboardKey {
  if (raw === undefined || isUnsafeCliScalar(raw)) {
    throw new AgentShellUsageError();
  }

  return raw as RemoteKeyboardKey;
}

function parseKeyboardModifiers(raw: string | undefined): RemoteInputModifier[] {
  if (raw === undefined) {
    return [];
  }

  if (isUnsafeCliScalar(raw)) {
    throw new AgentShellUsageError();
  }

  const modifiers = raw.split(",");
  if (modifiers.length === 0 || modifiers.length > 4 || new Set(modifiers).size !== modifiers.length) {
    throw new AgentShellUsageError();
  }

  for (const modifier of modifiers) {
    if (!REMOTE_INPUT_MODIFIERS.includes(modifier as RemoteInputModifier)) {
      throw new AgentShellUsageError();
    }
  }

  return modifiers as RemoteInputModifier[];
}

function parseIntegerOption(raw: string, min: number, max: number): number {
  if (isUnsafeCliScalar(raw)) {
    throw new AgentShellUsageError();
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < min || value > max || String(value) !== raw) {
    throw new AgentShellUsageError();
  }

  return value;
}

function isUnsafeCliScalar(raw: string): boolean {
  return (
    raw.trim().length === 0 ||
    raw !== raw.trim() ||
    hasAsciiControlCharacter(raw) ||
    hasUnsafeFormatCharacter(raw)
  );
}

function hasAnyOption(options: Map<string, string>, optionNames: readonly string[]): boolean {
  return optionNames.some((optionName) => options.has(optionName));
}

function assertNoOptions(options: Map<string, string>, optionNames: readonly string[]): void {
  for (const optionName of optionNames) {
    if (options.has(optionName)) {
      throw new AgentShellUsageError();
    }
  }
}

function parseHostDisconnectReason(role: SessionRole, raw: string | undefined): string | undefined {
  const reason = parseOptionalReason(raw);
  if (reason === undefined) {
    return undefined;
  }

  if (
    role !== "host" ||
    Buffer.byteLength(reason, "utf8") > MAX_AGENT_SHELL_DISCONNECT_REASON_BYTES
  ) {
    throw new AgentShellUsageError();
  }

  return reason;
}

function parseBooleanFlag(raw: string | undefined, defaultValue: boolean): boolean {
  if (raw === undefined) {
    return defaultValue;
  }

  if (raw === "true") {
    return true;
  }

  if (raw === "false") {
    return false;
  }

  throw new AgentShellUsageError();
}

function parseOptionalPermission(raw: string | undefined): Permission | undefined {
  if (!raw) {
    return undefined;
  }

  try {
    return PermissionSchema.parse(raw);
  } catch {
    throw new AgentShellUsageError();
  }
}

function parseOptionalReason(raw: string | undefined): string | undefined {
  if (raw === undefined) {
    return undefined;
  }

  if (
    raw.trim().length === 0 ||
    raw !== raw.trim() ||
    raw.length > MAX_AGENT_SHELL_REASON_LENGTH ||
    hasAsciiControlCharacter(raw) ||
    hasUnsafeFormatCharacter(raw) ||
    hasSecretBearingAuditMetadata(raw, { includeKeyAssignments: false })
  ) {
    throw new AgentShellUsageError();
  }

  return raw;
}

function parseOptionalAuditLogPath(raw: string | undefined): string | undefined {
  if (raw === undefined) {
    return undefined;
  }

  try {
    assertAuditLogPath(raw);
  } catch {
    throw new AgentShellUsageError();
  }

  return raw;
}

function parseOptionalToken(raw: string | undefined): string | undefined {
  if (raw === undefined) {
    return undefined;
  }

  if (
    raw.trim().length === 0 ||
    raw !== raw.trim() ||
    Buffer.byteLength(raw, "utf8") > MAX_AGENT_SHELL_TOKEN_BYTES ||
    hasAsciiControlCharacter(raw) ||
    hasUnsafeFormatCharacter(raw)
  ) {
    throw new AgentShellUsageError();
  }

  return raw;
}

function hasAsciiControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127) {
      return true;
    }
  }

  return false;
}

function hasUnsafeFormatCharacter(value: string): boolean {
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

function parseOptionalTimerDelayMs(raw: string | undefined): number | undefined {
  if (!raw) {
    return undefined;
  }

  const value = Number.parseInt(raw, 10);

  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > MAX_AGENT_SHELL_TIMER_DELAY_MS ||
    String(value) !== raw
  ) {
    throw new AgentShellUsageError();
  }

  return value;
}

function parseOptionalAuthorizationTtlMs(raw: string | undefined): number | undefined {
  if (!raw) {
    return undefined;
  }

  const value = Number.parseInt(raw, 10);

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_AGENT_SHELL_TIMER_DELAY_MS ||
    String(value) !== raw
  ) {
    throw new AgentShellUsageError();
  }

  return value;
}
