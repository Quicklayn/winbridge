import { describe, expect, it } from "vitest";
import { ConsoleAuditSink, MemoryAuditSink } from "./index.js";

describe("MemoryAuditSink", () => {
  it("stores audit records in write order", () => {
    const sink = new MemoryAuditSink();

    sink.write({
      actor: { type: "relay", id: "relay-dev" },
      action: "first",
      outcome: "accepted"
    });
    sink.write({
      actor: { type: "relay", id: "relay-dev" },
      action: "second",
      outcome: "failed"
    });

    expect(sink.records().map((record) => record.action)).toEqual(["first", "second"]);
  });

  it("validates records before storing them", () => {
    const sink = new MemoryAuditSink();

    expect(() =>
      sink.write({
        actor: { type: "relay", id: "" },
        action: "invalid",
        outcome: "failed"
      })
    ).toThrow();
    expect(sink.records()).toHaveLength(0);
  });

  it("redacts sensitive values before storing them", () => {
    const sink = new MemoryAuditSink();

    const record = sink.write({
      actor: { type: "relay", id: "relay-dev" },
      action: "relay.peer.join.denied",
      outcome: "denied",
      detail: {
        token: "secret",
        pairingCode: "123-456",
        password: "secret",
        keystroke: "typed",
        screenData: "pixels"
      }
    });

    expect(record.detail).toEqual({
      token: "[REDACTED]",
      pairingCode: "[REDACTED]",
      password: "[REDACTED]",
      keystroke: "[REDACTED]",
      screenData: "[REDACTED]"
    });
  });
});

describe("ConsoleAuditSink", () => {
  it("writes one JSON line per record", () => {
    const lines: string[] = [];
    const sink = new ConsoleAuditSink((line) => lines.push(line));

    sink.write({
      actor: { type: "relay", id: "relay-dev" },
      action: "relay.peer.disconnect",
      outcome: "accepted",
      sessionId: "session-demo"
    });

    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({
      action: "relay.peer.disconnect",
      sessionId: "session-demo"
    });
  });
});
