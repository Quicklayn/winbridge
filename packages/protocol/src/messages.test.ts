import { describe, expect, it } from "vitest";
import {
  createMessageBase,
  encodeProtocolEnvelope,
  parseProtocolEnvelope
} from "./messages.js";
import { assertConsentBoundGrant } from "./session.js";

describe("protocol envelopes", () => {
  it("accepts a valid hello message", () => {
    const parsed = parseProtocolEnvelope({
      ...createMessageBase("session-demo"),
      type: "hello",
      peerId: "host-1",
      role: "host",
      displayName: "Host",
      capabilities: ["session:visible"]
    });

    expect(parsed.type).toBe("hello");
  });

  it("rejects unknown protocol messages", () => {
    expect(() =>
      parseProtocolEnvelope({
        ...createMessageBase("session-demo"),
        type: "unknown",
        peerId: "host-1"
      })
    ).toThrow();
  });

  it("encodes only schema-valid envelopes", () => {
    const encoded = encodeProtocolEnvelope({
      ...createMessageBase("session-demo"),
      type: "relay-ready",
      peerId: "viewer-1",
      roomSize: 1
    });

    expect(JSON.parse(encoded)).toMatchObject({ type: "relay-ready" });
  });
});

describe("session grants", () => {
  it("requires explicit host approval and visible session", () => {
    const grant = assertConsentBoundGrant({
      sessionId: "session-demo",
      hostPeerId: "host-1",
      viewerPeerId: "viewer-1",
      permissions: ["screen:view"],
      requiresHostApproval: true,
      visibleSessionRequired: true,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      auditId: "audit-demo"
    });

    expect(grant.permissions).toContain("screen:view");
  });

  it("rejects expired grants", () => {
    expect(() =>
      assertConsentBoundGrant({
        sessionId: "session-demo",
        hostPeerId: "host-1",
        viewerPeerId: "viewer-1",
        permissions: ["screen:view"],
        requiresHostApproval: true,
        visibleSessionRequired: true,
        expiresAt: new Date(Date.now() - 60_000).toISOString(),
        auditId: "audit-demo"
      })
    ).toThrow("expired");
  });
});
