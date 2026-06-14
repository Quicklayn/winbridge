import { describe, expect, it } from "vitest";
import { createAuditRecord } from "./audit.js";
import {
  activateSessionAuthorization,
  approveSessionAuthorization,
  createPendingSessionAuthorization
} from "./authorization.js";
import { createDeviceIdentity } from "./identity.js";
import { deepFreeze } from "./immutable-snapshot.js";
import { createMessageBase, parseProtocolEnvelope } from "./messages.js";
import { assertConsentBoundGrant } from "./session.js";

const baseTime = new Date("2026-06-14T00:00:00.000Z");

describe("immutable protocol snapshots", () => {
  it("deep-freezes nested protocol data", () => {
    const input = {
      actor: { id: "host-1" },
      permissions: ["screen:view"],
      nested: [{ state: "active" }]
    };
    const frozen = deepFreeze(input);

    expect(frozen).toBe(input);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.actor)).toBe(true);
    expect(Object.isFrozen(frozen.permissions)).toBe(true);
    expect(Object.isFrozen(frozen.nested)).toBe(true);
    expect(Object.isFrozen(frozen.nested[0])).toBe(true);
    expect(() => {
      frozen.actor.id = "viewer-1";
    }).toThrow(TypeError);
    expect(() => {
      frozen.permissions.push("input:pointer");
    }).toThrow(TypeError);
    expect(() => {
      frozen.nested[0].state = "paused";
    }).toThrow(TypeError);
  });

  it("freezes repeated references once while preserving identity", () => {
    const shared = { state: "active" };
    const input = {
      first: shared,
      second: shared,
      nested: [shared]
    };
    const frozen = deepFreeze(input);

    expect(frozen).toBe(input);
    expect(frozen.first).toBe(shared);
    expect(frozen.second).toBe(shared);
    expect(frozen.nested[0]).toBe(shared);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.nested)).toBe(true);
    expect(Object.isFrozen(shared)).toBe(true);
    expect(() => {
      frozen.second.state = "paused";
    }).toThrow(TypeError);
  });

  it("freezes cyclic references without recursive traversal failure", () => {
    type CyclicSnapshot = {
      label: string;
      nested: {
        parent?: CyclicSnapshot;
      };
      self?: CyclicSnapshot;
    };
    const input: CyclicSnapshot = {
      label: "root",
      nested: {}
    };
    input.self = input;
    input.nested.parent = input;

    const frozen = deepFreeze(input);

    expect(frozen).toBe(input);
    expect(frozen.self).toBe(frozen);
    expect(frozen.nested.parent).toBe(frozen);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.nested)).toBe(true);
    expect(() => {
      frozen.label = "changed";
    }).toThrow(TypeError);
    expect(() => {
      frozen.nested.parent = undefined;
    }).toThrow(TypeError);
  });

  it("preserves primitive, null, and already frozen values", () => {
    const alreadyFrozen = Object.freeze({ safe: true });

    expect(deepFreeze("metadata")).toBe("metadata");
    expect(deepFreeze(null)).toBeNull();
    expect(deepFreeze(alreadyFrozen)).toBe(alreadyFrozen);
  });

  it("keeps representative protocol snapshots immutable", () => {
    const pending = createPendingSessionAuthorization({
      sessionId: "session-demo",
      hostPeerId: "host-1",
      viewerPeerId: "viewer-1",
      requestedPermissions: ["screen:view"],
      now: baseTime
    });
    const active = activateSessionAuthorization(
      approveSessionAuthorization(pending, {
        grantedPermissions: ["screen:view"],
        now: baseTime
      }),
      { visibleToHost: true, now: baseTime }
    );
    const auditRecord = createAuditRecord({
      eventId: "audit-demo",
      timestamp: baseTime.toISOString(),
      actor: { type: "host", id: "host-1", deviceId: "device-host-1" },
      action: "agent-shell.authorization.active",
      outcome: "accepted",
      sessionId: "session-demo",
      detail: {
        authorizationId: "authz-demo",
        nested: { safe: "kept" }
      }
    });
    const identity = createDeviceIdentity({
      deviceId: "device-host-1",
      displayName: "Host",
      platform: "windows",
      now: baseTime
    });
    const envelope = parseProtocolEnvelope({
      ...createMessageBase("session-demo"),
      type: "hello",
      peerId: "host-1",
      role: "host",
      displayName: "Host",
      capabilities: ["session:visible"]
    });
    const grant = assertConsentBoundGrant(
      {
        sessionId: "session-demo",
        hostPeerId: "host-1",
        viewerPeerId: "viewer-1",
        permissions: ["screen:view"],
        requiresHostApproval: true,
        visibleSessionRequired: true,
        expiresAt: "2099-01-01T00:00:00.000Z",
        auditId: "audit-demo"
      },
      baseTime
    );

    expect(Object.isFrozen(active)).toBe(true);
    expect(Object.isFrozen(active.permissions)).toBe(true);
    expect(Object.isFrozen(auditRecord)).toBe(true);
    expect(Object.isFrozen(auditRecord.actor)).toBe(true);
    expect(Object.isFrozen(auditRecord.detail)).toBe(true);
    expect(Object.isFrozen(auditRecord.detail.nested as object)).toBe(true);
    expect(Object.isFrozen(identity)).toBe(true);
    expect(Object.isFrozen(envelope)).toBe(true);
    if (envelope.type !== "hello") {
      throw new Error("Expected hello envelope");
    }
    expect(Object.isFrozen(envelope.capabilities)).toBe(true);
    expect(Object.isFrozen(grant)).toBe(true);
    expect(Object.isFrozen(grant.permissions)).toBe(true);

    expect(JSON.parse(JSON.stringify(auditRecord))).toMatchObject({
      actor: { id: "host-1" },
      detail: { authorizationId: "authz-demo", nested: { safe: "kept" } }
    });
  });
});
