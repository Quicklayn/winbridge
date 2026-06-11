import { describe, expect, it } from "vitest";
import { RoomRegistry, type RelayPeer } from "./rooms.js";

function peer(overrides: Partial<RelayPeer>): RelayPeer {
  return {
    peerId: "host-1",
    role: "host",
    sessionId: "session-demo",
    pairingCode: "123-456",
    send: () => undefined,
    ...overrides
  };
}

describe("RoomRegistry", () => {
  it("allows one host and one viewer in a room", () => {
    const rooms = new RoomRegistry();

    rooms.join(peer({ peerId: "host-1", role: "host" }));
    rooms.join(peer({ peerId: "viewer-1", role: "viewer" }));

    expect(rooms.size("session-demo")).toBe(2);
  });

  it("rejects a second peer with the same role", () => {
    const rooms = new RoomRegistry();

    rooms.join(peer({ peerId: "host-1", role: "host" }));

    expect(() => rooms.join(peer({ peerId: "host-2", role: "host" }))).toThrow(
      "already connected"
    );
  });

  it("removes empty rooms", () => {
    const rooms = new RoomRegistry();

    rooms.join(peer({ peerId: "host-1", role: "host" }));
    rooms.leave("session-demo", "host-1");

    expect(rooms.size("session-demo")).toBe(0);
  });
});
