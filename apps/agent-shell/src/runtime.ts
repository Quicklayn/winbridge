import { randomUUID } from "node:crypto";
import WebSocket from "ws";
import {
  createDeviceIdentity,
  createMessageBase,
  decodeProtocolEnvelope,
  encodeProtocolEnvelope,
  PairingCodeSchema,
  PermissionSchema,
  type Permission,
  type ProtocolEnvelope,
  type SessionRole
} from "@winbridge/protocol";

export type HostDecision = "none" | "approve" | "deny";

export type AgentShellRuntimeOptions = {
  role: SessionRole;
  relayUrl: string;
  sessionId: string;
  pairingCode: string;
  peerId: string;
  displayName: string;
  token?: string;
  deviceId: string;
  requestedPermissions?: Permission[];
  hostDecision?: HostDecision;
  visibleToHost?: boolean;
  decisionReason?: string;
  authorizationTtlMs?: number;
  logger?: {
    log(message: string): void;
    error(message: string): void;
  };
  onEvent?: (event: AgentShellEvent) => void;
};

export type AgentShellEvent =
  | { direction: "sent"; message: ProtocolEnvelope }
  | { direction: "received"; message: ProtocolEnvelope }
  | { direction: "raw"; text: string }
  | { direction: "closed"; code: number; reason: string };

export type AgentShellRuntime = {
  start(): Promise<void>;
  stop(): Promise<void>;
  send(message: ProtocolEnvelope): void;
};

export function createAgentShellRuntime(options: AgentShellRuntimeOptions): AgentShellRuntime {
  const logger = options.logger ?? console;
  const relayUrl = new URL(options.relayUrl);
  let socket: WebSocket | undefined;

  if (options.token) {
    relayUrl.searchParams.set("token", options.token);
  }

  return {
    async start() {
      socket = new WebSocket(relayUrl);

      socket.on("message", (data) => {
        handleMessage(data.toString(), socket, options);
      });

      socket.on("close", (code, reason) => {
        const event = { direction: "closed", code, reason: reason.toString() } as const;
        options.onEvent?.(event);
        logger.log(`[winbridge-agent] disconnected code=${code} reason=${reason.toString()}`);
      });

      socket.on("error", (error) => {
        logger.error(`[winbridge-agent] socket error ${error.message}`);
      });

      await new Promise<void>((resolve, reject) => {
        socket?.once("open", () => {
          logger.log(`[winbridge-agent] ${options.role} connected to ${relayUrl.origin}`);
          logger.log("[winbridge-agent] Native screen capture and remote input are not implemented.");
          logger.log("[winbridge-agent] This shell only exercises the consent/session protocol.");

          const deviceIdentity = createDeviceIdentity({
            displayName: options.displayName,
            platform: currentPlatform(),
            deviceId: options.deviceId
          });

          sendProtocol(socket, options, {
            ...createMessageBase(options.sessionId),
            type: "join-session",
            peerId: options.peerId,
            role: options.role,
            pairingCode: PairingCodeSchema.parse(options.pairingCode),
            deviceIdentity
          });

          sendProtocol(socket, options, {
            ...createMessageBase(options.sessionId),
            type: "hello",
            peerId: options.peerId,
            role: options.role,
            displayName: options.displayName,
            capabilities: ["session:visible", "consent:required", "audit:stdout"]
          });

          resolve();
        });
        socket?.once("error", reject);
      });
    },

    async stop() {
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        return;
      }

      await new Promise<void>((resolve) => {
        socket?.once("close", () => resolve());
        socket?.close();
      });
    },

    send(message: ProtocolEnvelope) {
      if (!socket) {
        throw new Error("Agent shell runtime is not started");
      }

      sendProtocol(socket, options, message);
    }
  };
}

function handleMessage(
  text: string,
  socket: WebSocket | undefined,
  options: AgentShellRuntimeOptions
): void {
  try {
    const envelope = decodeProtocolEnvelope(text);
    options.onEvent?.({ direction: "received", message: envelope });
    options.logger?.log(`[winbridge-agent] received ${JSON.stringify(envelope)}`);

    if (envelope.type === "relay-ready" && options.role === "viewer") {
      sendViewerAuthorizationRequest(socket, options);
    }

    if (envelope.type === "session-authorization-request" && options.role === "host") {
      handleHostAuthorizationRequest(socket, options, envelope);
    }
  } catch {
    options.onEvent?.({ direction: "raw", text });
    options.logger?.log(`[winbridge-agent] received non-protocol message ${text}`);
  }
}

function sendViewerAuthorizationRequest(
  socket: WebSocket | undefined,
  options: AgentShellRuntimeOptions
): void {
  const requestedPermissions = options.requestedPermissions ?? [];

  if (requestedPermissions.length === 0) {
    return;
  }

  sendProtocol(socket, options, {
    ...createMessageBase(options.sessionId),
    type: "session-authorization-request",
    viewerPeerId: options.peerId,
    requestedPermissions,
    reason: "Development agent-shell request"
  });
}

function handleHostAuthorizationRequest(
  socket: WebSocket | undefined,
  options: AgentShellRuntimeOptions,
  request: Extract<ProtocolEnvelope, { type: "session-authorization-request" }>
): void {
  const decision = options.hostDecision ?? "none";

  if (decision === "none") {
    options.logger?.log("[winbridge-agent] authorization request received; no host decision configured");
    return;
  }

  const authorizationId = `authz_${randomUUID()}`;

  if (decision === "deny") {
    sendProtocol(socket, options, {
      ...createMessageBase(options.sessionId),
      type: "session-authorization-decision",
      authorizationId,
      hostPeerId: options.peerId,
      viewerPeerId: request.viewerPeerId,
      decision: "denied",
      grantedPermissions: [],
      reason: options.decisionReason ?? "Host denied"
    });
    return;
  }

  const expiresAt = new Date(Date.now() + (options.authorizationTtlMs ?? 10 * 60_000)).toISOString();

  sendProtocol(socket, options, {
    ...createMessageBase(options.sessionId),
    type: "session-authorization-decision",
    authorizationId,
    hostPeerId: options.peerId,
    viewerPeerId: request.viewerPeerId,
    decision: "approved",
    grantedPermissions: request.requestedPermissions,
    expiresAt
  });

  if (!options.visibleToHost) {
    options.logger?.log("[winbridge-agent] approval sent; active state withheld because visible session is false");
    return;
  }

  sendProtocol(socket, options, {
    ...createMessageBase(options.sessionId),
    type: "session-authorization-state",
    authorizationId,
    actorPeerId: options.peerId,
    status: "active",
    visibleToHost: true,
    permissions: request.requestedPermissions,
    expiresAt
  });
}

function sendProtocol(
  socket: WebSocket | undefined,
  options: AgentShellRuntimeOptions,
  message: ProtocolEnvelope
): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("Agent shell socket is not open");
  }

  socket.send(encodeProtocolEnvelope(message));
  options.onEvent?.({ direction: "sent", message });
}

function currentPlatform() {
  if (process.platform === "win32") {
    return "windows";
  }

  if (process.platform === "darwin") {
    return "macos";
  }

  if (process.platform === "linux") {
    return "linux";
  }

  return "unknown";
}

export function parsePermissions(raw: string | undefined): Permission[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((permission) => PermissionSchema.parse(permission.trim()))
    .filter((permission, index, permissions) => permissions.indexOf(permission) === index);
}
