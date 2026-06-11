import { describe, expect, it } from "vitest";
import { createAuditRecord, redactAuditDetail } from "./audit.js";

describe("audit records", () => {
  it("creates schema-valid structured audit records", () => {
    const record = createAuditRecord({
      actor: { type: "relay", id: "relay-dev" },
      action: "relay.peer.join.accepted",
      outcome: "accepted",
      sessionId: "session-demo",
      detail: { role: "viewer" }
    });

    expect(record.action).toBe("relay.peer.join.accepted");
    expect(record.detail).toEqual({ role: "viewer" });
  });

  it("rejects records without required actor metadata", () => {
    expect(() =>
      createAuditRecord({
        actor: { type: "relay", id: "" },
        action: "relay.peer.join.accepted",
        outcome: "accepted"
      })
    ).toThrow();
  });

  it("redacts sensitive audit detail fields", () => {
    const redacted = redactAuditDetail({
      token: "secret-token",
      pairingCode: "123-456",
      credential: "secret-credential",
      nested: {
        keystroke: "abc",
        screenshot: "raw-image",
        screenData: "raw-screen"
      },
      safe: "kept"
    });

    expect(redacted).toEqual({
      token: "[REDACTED]",
      pairingCode: "[REDACTED]",
      credential: "[REDACTED]",
      nested: {
        keystroke: "[REDACTED]",
        screenshot: "[REDACTED]",
        screenData: "[REDACTED]"
      },
      safe: "kept"
    });
  });
});
