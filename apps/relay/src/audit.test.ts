import { MemoryAuditSink } from "@winbridge/audit-log";
import { describe, expect, it } from "vitest";
import { writeRelayAudit } from "./audit.js";

describe("relay audit", () => {
  it("redacts raw token and pairing code if a caller passes them by mistake", () => {
    const sink = new MemoryAuditSink();

    const record = writeRelayAudit(sink, {
      action: "relay.peer.join.denied",
      outcome: "denied",
      sessionId: "session-demo",
      peerId: "viewer-1",
      detail: {
        token: "secret-token",
        pairingCode: "123-456",
        role: "viewer"
      }
    });

    const serialized = JSON.stringify(record);
    expect(serialized).not.toContain("secret-token");
    expect(serialized).not.toContain("123-456");
    expect(record.detail).toMatchObject({
      token: "[REDACTED]",
      pairingCode: "[REDACTED]",
      role: "viewer"
    });
  });
});
