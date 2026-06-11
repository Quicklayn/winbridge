import { MemoryAuditSink } from "@winbridge/audit-log";
import { createMessageBase, type Permission, type ProtocolEnvelope } from "@winbridge/protocol";
import { afterEach, describe, expect, it } from "vitest";
import { createRelayRuntime, type RelayRuntime } from "../../relay/src/server.js";
import { createAgentShellRuntime, type AgentShellEvent, type AgentShellRuntime } from "./runtime.js";

type TestLogger = {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
};

const silentLogger: TestLogger = {
  log: () => undefined,
  warn: () => undefined,
  error: () => undefined
};

const relayRuntimes: RelayRuntime[] = [];
const agentRuntimes: AgentShellRuntime[] = [];

afterEach(async () => {
  await Promise.all(agentRuntimes.splice(0).map((runtime) => runtime.stop()));
  await Promise.all(relayRuntimes.splice(0).map((runtime) => runtime.stop()));
});

describe("agent shell consent workflow", () => {
  it("sends viewer authorization requests through the relay to the host", async () => {
    const { relay, hostEvents, viewerEvents } = await startRelayAndHost();
    await startViewer(relay.url(), ["screen:view"], viewerEvents);

    const request = await waitForMessage(
      hostEvents,
      (message) => message.type === "session-authorization-request"
    );

    expect(request).toMatchObject({
      type: "session-authorization-request",
      viewerPeerId: "viewer-1",
      requestedPermissions: ["screen:view"]
    });
  });

  it("does not send a host decision when host decision is omitted", async () => {
    const { relay, hostEvents, viewerEvents } = await startRelayAndHost();
    await startViewer(relay.url(), ["screen:view"], viewerEvents);

    await waitForMessage(hostEvents, (message) => message.type === "session-authorization-request");
    await delay(100);

    expect(
      viewerEvents.some(
        (event) =>
          event.direction === "received" &&
          event.message.type === "session-authorization-decision"
      )
    ).toBe(false);
  });

  it("sends approved decision and active visible state when host explicitly approves visibly", async () => {
    const { relay, viewerEvents } = await startRelayAndHost({
      hostDecision: "approve",
      visibleToHost: true
    });
    await startViewer(relay.url(), ["screen:view"], viewerEvents);

    const decision = await waitForMessage(
      viewerEvents,
      (message) => message.type === "session-authorization-decision"
    );
    const state = await waitForMessage(
      viewerEvents,
      (message) => message.type === "session-authorization-state"
    );

    expect(decision).toMatchObject({
      type: "session-authorization-decision",
      decision: "approved",
      grantedPermissions: ["screen:view"]
    });
    expect(state).toMatchObject({
      type: "session-authorization-state",
      status: "active",
      visibleToHost: true,
      permissions: ["screen:view"]
    });
  });

  it("withholds active state when host approves without visible session state", async () => {
    const { relay, viewerEvents } = await startRelayAndHost({
      hostDecision: "approve",
      visibleToHost: false
    });
    await startViewer(relay.url(), ["screen:view"], viewerEvents);

    await waitForMessage(viewerEvents, (message) => message.type === "session-authorization-decision");
    await delay(100);

    expect(
      viewerEvents.some(
        (event) => event.direction === "received" && event.message.type === "session-authorization-state"
      )
    ).toBe(false);
  });

  it("sends revoked state after host revokes the only granted permission", async () => {
    const { relay, viewerEvents } = await startRelayAndHost({
      hostDecision: "approve",
      hostRevokeAfterMs: 10,
      hostRevokePermission: "screen:view",
      visibleToHost: true
    });
    await startViewer(relay.url(), ["screen:view"], viewerEvents);

    await waitForMessage(
      viewerEvents,
      (message) => message.type === "session-authorization-state" && message.status === "active"
    );
    const revoked = await waitForMessage(
      viewerEvents,
      (message) => message.type === "permission-revoked"
    );
    const revokedState = await waitForMessage(
      viewerEvents,
      (message) => message.type === "session-authorization-state" && message.status === "revoked"
    );

    expect(revoked).toMatchObject({
      type: "permission-revoked",
      revokedPermission: "screen:view"
    });
    expect(revokedState).toMatchObject({
      type: "session-authorization-state",
      status: "revoked",
      visibleToHost: true,
      permissions: []
    });
  });

  it("keeps remaining permissions active after host revokes one granted permission", async () => {
    const { relay, viewerEvents } = await startRelayAndHost({
      hostDecision: "approve",
      hostRevokeAfterMs: 10,
      hostRevokePermission: "screen:view",
      visibleToHost: true
    });
    await startViewer(relay.url(), ["screen:view", "input:pointer"], viewerEvents);

    await waitForMessage(
      viewerEvents,
      (message) => message.type === "permission-revoked" && message.revokedPermission === "screen:view"
    );
    const partialState = await waitForMessage(
      viewerEvents,
      (message) =>
        message.type === "session-authorization-state" &&
        message.status === "active" &&
        !message.permissions.includes("screen:view")
    );

    expect(partialState).toMatchObject({
      type: "session-authorization-state",
      status: "active",
      visibleToHost: true,
      permissions: ["input:pointer"]
    });
  });

  it("does not send revoke messages when visible active state is withheld", async () => {
    const { relay, viewerEvents } = await startRelayAndHost({
      hostDecision: "approve",
      hostRevokeAfterMs: 10,
      hostRevokePermission: "screen:view",
      visibleToHost: false
    });
    await startViewer(relay.url(), ["screen:view"], viewerEvents);

    await waitForMessage(viewerEvents, (message) => message.type === "session-authorization-decision");
    await delay(50);

    expect(
      viewerEvents.some(
        (event) => event.direction === "received" && event.message.type === "permission-revoked"
      )
    ).toBe(false);
  });

  it("logs protocol message summaries without raw payloads", async () => {
    const { relay, host, viewerEvents } = await startRelayAndHost();
    const viewerLogs: string[] = [];
    await startViewer(relay.url(), [], viewerEvents, captureLogger(viewerLogs));

    await waitForMessage(
      viewerEvents,
      (message) => message.type === "relay-ready" && message.peerId === "viewer-1"
    );
    host.send({
      ...createMessageBase("session-demo"),
      type: "signal",
      fromPeerId: "host-1",
      toPeerId: "viewer-1",
      payload: {
        token: "secret-token",
        pairingCode: "123-456",
        nested: { credential: "viewer-password" }
      }
    });
    await waitForMessage(viewerEvents, (message) => message.type === "signal");

    const logOutput = viewerLogs.join("\n");
    expect(logOutput).toContain("received signal");
    expect(logOutput).not.toContain("secret-token");
    expect(logOutput).not.toContain("123-456");
    expect(logOutput).not.toContain("viewer-password");
    expect(logOutput).not.toContain("payload");
  });

  it("logs non-protocol message summaries without raw text", async () => {
    const hostLogs: string[] = [];
    const { host, hostEvents } = await startRelayAndHost({
      hostLogger: captureLogger(hostLogs)
    });

    await waitForMessage(
      hostEvents,
      (message) => message.type === "relay-ready" && message.peerId === "host-1"
    );
    host.send({
      ...createMessageBase("different-session"),
      type: "signal",
      fromPeerId: "host-1",
      payload: { secret: "do-not-log" }
    });
    await waitForRawMessage(hostEvents);

    const logOutput = hostLogs.join("\n");
    expect(logOutput).toContain("received non-protocol message bytes=");
    expect(logOutput).not.toContain("relay-error");
    expect(logOutput).not.toContain("Message session does not match registered peer");
  });
});

async function startRelayAndHost(options: {
  hostDecision?: "none" | "approve" | "deny";
  hostLogger?: TestLogger;
  hostRevokeAfterMs?: number;
  hostRevokePermission?: Permission;
  visibleToHost?: boolean;
} = {}) {
  const relay = createRelayRuntime({
    port: 0,
    auditSink: new MemoryAuditSink(),
    heartbeat: false,
    logger: silentLogger
  });
  await relay.start();
  relayRuntimes.push(relay);

  const hostEvents: AgentShellEvent[] = [];
  const viewerEvents: AgentShellEvent[] = [];
  const host = createAgentShellRuntime({
    role: "host",
    relayUrl: relay.url(),
    sessionId: "session-demo",
    pairingCode: "123-456",
    peerId: "host-1",
    displayName: "Host",
    deviceId: "dev_host_1",
    hostDecision: options.hostDecision ?? "none",
    hostRevokeAfterMs: options.hostRevokeAfterMs,
    hostRevokePermission: options.hostRevokePermission,
    visibleToHost: options.visibleToHost ?? false,
    logger: options.hostLogger ?? silentLogger,
    onEvent: (event) => hostEvents.push(event)
  });
  await host.start();
  agentRuntimes.push(host);

  return { relay, host, hostEvents, viewerEvents };
}

async function startViewer(
  relayUrl: string,
  requestedPermissions: Permission[],
  viewerEvents: AgentShellEvent[] = [],
  logger: TestLogger = silentLogger
): Promise<AgentShellRuntime> {
  const viewer = createAgentShellRuntime({
    role: "viewer",
    relayUrl,
    sessionId: "session-demo",
    pairingCode: "123-456",
    peerId: "viewer-1",
    displayName: "Viewer",
    deviceId: "dev_viewer_1",
    requestedPermissions,
    logger,
    onEvent: (event) => viewerEvents.push(event)
  });
  await viewer.start();
  agentRuntimes.push(viewer);
  return viewer;
}

function waitForMessage(
  events: AgentShellEvent[],
  predicate: (message: ProtocolEnvelope) => boolean
): Promise<ProtocolEnvelope> {
  return withTimeout(
    new Promise((resolve) => {
      const interval = setInterval(() => {
        const match = events.find(
          (event) => event.direction === "received" && predicate(event.message)
        );

        if (match?.direction === "received") {
          clearInterval(interval);
          resolve(match.message);
        }
      }, 5);
    })
  );
}

function waitForRawMessage(events: AgentShellEvent[]): Promise<string> {
  return withTimeout(
    new Promise((resolve) => {
      const interval = setInterval(() => {
        const match = events.find((event) => event.direction === "raw");

        if (match?.direction === "raw") {
          clearInterval(interval);
          resolve(match.text);
        }
      }, 5);
    })
  );
}

function captureLogger(logs: string[]): TestLogger {
  return {
    log: (message) => logs.push(message),
    warn: (message) => logs.push(message),
    error: (message) => logs.push(message)
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out waiting for agent event")), 5000);

    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}
