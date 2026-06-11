import { MemoryAuditSink } from "@winbridge/audit-log";
import type { Permission, ProtocolEnvelope } from "@winbridge/protocol";
import { afterEach, describe, expect, it } from "vitest";
import { createRelayRuntime, type RelayRuntime } from "../../relay/src/server.js";
import { createAgentShellRuntime, type AgentShellEvent, type AgentShellRuntime } from "./runtime.js";

const silentLogger = {
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
});

async function startRelayAndHost(options: {
  hostDecision?: "none" | "approve" | "deny";
  visibleToHost?: boolean;
} = {}) {
  const relay = createRelayRuntime({
    port: 0,
    auditSink: new MemoryAuditSink(),
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
    visibleToHost: options.visibleToHost ?? false,
    logger: silentLogger,
    onEvent: (event) => hostEvents.push(event)
  });
  await host.start();
  agentRuntimes.push(host);

  return { relay, hostEvents, viewerEvents };
}

async function startViewer(
  relayUrl: string,
  requestedPermissions: Permission[],
  viewerEvents: AgentShellEvent[] = []
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
    logger: silentLogger,
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
