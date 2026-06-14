import { describe, expect, it } from "vitest";
import {
  MAX_RELAY_PAIRING_TICKET_TTL_MS,
  RoomRegistry,
  SAME_ROLE_RELAY_PEER_JOIN_REASON,
  normalizeRelayPairingConfig,
  type RelayPairingConfig,
  type RelayPeer
} from "./rooms.js";

function peer(overrides: Partial<RelayPeer>): RelayPeer {
  return {
    peerId: "host-1",
    role: "host",
    sessionId: "session-demo",
    deviceId: "dev_host_1",
    send: () => true,
    close: () => undefined,
    ...overrides
  };
}

function joinPeer(
  overrides: Partial<RelayPeer> & { pairingCode?: string } = {}
): RelayPeer & { pairingCode: string } {
  const { pairingCode, ...peerOverrides } = overrides;

  return {
    ...peer(peerOverrides),
    pairingCode: pairingCode ?? "123-456"
  };
}

describe("RoomRegistry", () => {
  it("allows one host and one viewer in a room", () => {
    const rooms = new RoomRegistry();

    const hostJoin = rooms.join(joinPeer({ peerId: "host-1", role: "host" }));
    const viewerJoin = rooms.join(
      joinPeer({ peerId: "viewer-1", role: "viewer", deviceId: "dev_viewer_1" })
    );

    expect(rooms.size("session-demo")).toBe(2);
    expect(hostJoin).toMatchObject({
      ticketCreated: true,
      ticketConsumed: false,
      ticketRemainingUses: 1
    });
    expect(viewerJoin).toMatchObject({
      ticketCreated: false,
      ticketConsumed: true,
      ticketRemainingUses: 0,
      pairedDevice: {
        sessionId: "session-demo",
        hostDeviceId: "dev_host_1",
        viewerDeviceId: "dev_viewer_1"
      }
    });
    expect(JSON.stringify(rooms.peers("session-demo"))).not.toContain("123-456");
  });

  it("returns immutable join peer snapshots", () => {
    const rooms = new RoomRegistry();
    const originalSend = () => true;
    const originalClose = () => undefined;

    const hostJoin = rooms.join(
      joinPeer({
        peerId: "host-1",
        role: "host",
        send: originalSend,
        close: originalClose
      })
    );
    const [host] = hostJoin.peers;

    expect(Object.isFrozen(hostJoin.peers)).toBe(true);
    expect(Object.isFrozen(host)).toBe(true);
    expect(() => {
      hostJoin.peers.push(peer({ peerId: "viewer-1", role: "viewer" }));
    }).toThrow(TypeError);
    expect(() => {
      host.peerId = "viewer-1";
    }).toThrow(TypeError);
    expect(() => {
      host.role = "viewer";
    }).toThrow(TypeError);
    expect(() => {
      host.deviceId = "dev_viewer_1";
    }).toThrow(TypeError);
    expect(() => {
      host.send = () => false;
    }).toThrow(TypeError);
    expect(() => {
      host.close = () => undefined;
    }).toThrow(TypeError);

    const [registeredHost] = rooms.peers("session-demo");
    expect(registeredHost).toMatchObject({
      peerId: "host-1",
      role: "host",
      sessionId: "session-demo",
      deviceId: "dev_host_1"
    });
    expect(registeredHost?.send).toBe(originalSend);
    expect(registeredHost?.close).toBe(originalClose);
  });

  it("returns immutable peer lookup snapshots without changing membership", () => {
    const rooms = new RoomRegistry();
    const originalViewerSend = () => true;

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));
    rooms.join(
      joinPeer({
        peerId: "viewer-1",
        role: "viewer",
        deviceId: "dev_viewer_1",
        send: originalViewerSend
      })
    );

    const peers = rooms.peers("session-demo");
    const viewer = peers.find((existing) => existing.peerId === "viewer-1");

    expect(Object.isFrozen(peers)).toBe(true);
    expect(Object.isFrozen(viewer)).toBe(true);
    expect(() => {
      peers.pop();
    }).toThrow(TypeError);
    expect(() => {
      peers[0] = peer({ peerId: "viewer-2", role: "viewer", deviceId: "dev_viewer_2" });
    }).toThrow(TypeError);
    expect(() => {
      viewer!.peerId = "viewer-2";
    }).toThrow(TypeError);
    expect(() => {
      viewer!.send = () => false;
    }).toThrow(TypeError);

    expect(rooms.size("session-demo")).toBe(2);
    expect(rooms.hasPeer("session-demo", "viewer-1")).toBe(true);
    expect(rooms.peers("session-demo").find((existing) => existing.peerId === "viewer-1")?.send).toBe(
      originalViewerSend
    );

    const missingRoomPeers = rooms.peers("missing-session");
    expect(Object.isFrozen(missingRoomPeers)).toBe(true);
    expect(() => {
      missingRoomPeers.push(peer({ peerId: "host-2", role: "host", sessionId: "missing-session" }));
    }).toThrow(TypeError);
  });

  it("rejects a second peer with the same role", () => {
    const rooms = new RoomRegistry();

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));

    expect(() => rooms.join(joinPeer({ peerId: "host-2", role: "host" }))).toThrow(
      SAME_ROLE_RELAY_PEER_JOIN_REASON
    );
  });

  it("rejects a duplicate live host without replacing peer or refreshing pairing", () => {
    const rooms = new RoomRegistry();
    const originalSend = () => true;

    rooms.join(joinPeer({ peerId: "host-1", role: "host", send: originalSend }));

    expect(() =>
      rooms.join(joinPeer({ peerId: "host-1", role: "host", pairingCode: "999-000" }))
    ).toThrow("Peer is already connected to session");
    expect(rooms.size("session-demo")).toBe(1);
    expect(rooms.peers("session-demo")[0]?.send).toBe(originalSend);

    expect(() =>
      rooms.join(
        joinPeer({
          peerId: "viewer-1",
          role: "viewer",
          deviceId: "dev_viewer_1",
          pairingCode: "999-000"
        })
      )
    ).toThrow("Pairing code mismatch");
    expect(
      rooms.join(joinPeer({ peerId: "viewer-1", role: "viewer", deviceId: "dev_viewer_1" }))
    ).toMatchObject({
      ticketConsumed: true
    });
  });

  it("rejects a duplicate live viewer without replacing peer or consuming pairing", () => {
    const rooms = new RoomRegistry({ ticketTtlMs: 60_000, maxUses: 2 });
    const originalViewerSend = () => true;

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));
    rooms.join(
      joinPeer({
        peerId: "viewer-1",
        role: "viewer",
        deviceId: "dev_viewer_1",
        send: originalViewerSend
      })
    );

    expect(() =>
      rooms.join(
        joinPeer({
          peerId: "viewer-1",
          role: "viewer",
          deviceId: "dev_viewer_1",
          send: () => false
        })
      )
    ).toThrow("Peer is already connected to session");
    expect(rooms.size("session-demo")).toBe(2);
    expect(rooms.peers("session-demo").find((existing) => existing.peerId === "viewer-1")?.send).toBe(
      originalViewerSend
    );

    rooms.leave("session-demo", "viewer-1");
    expect(
      rooms.join(joinPeer({ peerId: "viewer-2", role: "viewer", deviceId: "dev_viewer_2" }))
    ).toMatchObject({
      ticketConsumed: true,
      ticketRemainingUses: 0
    });
  });

  it("allows the same peer id to join after leave cleanup", () => {
    const rooms = new RoomRegistry();
    const replacementSend = () => true;

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));
    rooms.leave("session-demo", "host-1");

    expect(
      rooms.join(
        joinPeer({
          peerId: "host-1",
          role: "host",
          pairingCode: "999-000",
          send: replacementSend
        })
      )
    ).toMatchObject({
      ticketCreated: true,
      ticketConsumed: false
    });
    expect(rooms.peers("session-demo")[0]?.send).toBe(replacementSend);
    expect(
      rooms.join(
        joinPeer({
          peerId: "viewer-1",
          role: "viewer",
          deviceId: "dev_viewer_1",
          pairingCode: "999-000"
        })
      )
    ).toMatchObject({
      ticketConsumed: true
    });
  });

  it("clears stale viewer membership when the host leaves a paired room", () => {
    const rooms = new RoomRegistry();

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));
    rooms.join(joinPeer({ peerId: "viewer-1", role: "viewer", deviceId: "dev_viewer_1" }));

    const leaveResult = rooms.leave("session-demo", "host-1");

    expect(leaveResult.remainingPeers.map((existing) => existing.peerId)).toEqual(["viewer-1"]);
    expect(leaveResult.removedPeers.map((existing) => existing.peerId)).toEqual(["viewer-1"]);
    expect(rooms.size("session-demo")).toBe(0);
    expect(rooms.hasPeer("session-demo", "viewer-1")).toBe(false);

    expect(
      rooms.join(joinPeer({ peerId: "host-2", role: "host", pairingCode: "999-000" }))
    ).toMatchObject({
      ticketCreated: true,
      ticketConsumed: false,
      ticketRemainingUses: 1
    });
    expect(rooms.size("session-demo")).toBe(1);
    expect(rooms.peers("session-demo").map((existing) => existing.peerId)).toEqual(["host-2"]);
    expect(() =>
      rooms.join(
        joinPeer({
          peerId: "viewer-1",
          role: "viewer",
          deviceId: "dev_viewer_1",
          pairingCode: "123-456"
        })
      )
    ).toThrow("Pairing code mismatch");
    expect(
      rooms.join(
        joinPeer({
          peerId: "viewer-1",
          role: "viewer",
          deviceId: "dev_viewer_1",
          pairingCode: "999-000"
        })
      )
    ).toMatchObject({
      ticketConsumed: true,
      ticketRemainingUses: 0
    });
  });

  it("returns immutable leave cleanup snapshots", () => {
    const rooms = new RoomRegistry();
    const viewerClose = () => undefined;

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));
    rooms.join(
      joinPeer({
        peerId: "viewer-1",
        role: "viewer",
        deviceId: "dev_viewer_1",
        close: viewerClose
      })
    );

    const leaveResult = rooms.leave("session-demo", "host-1");
    const [remainingViewer] = leaveResult.remainingPeers;
    const [removedViewer] = leaveResult.removedPeers;

    expect(Object.isFrozen(leaveResult.remainingPeers)).toBe(true);
    expect(Object.isFrozen(leaveResult.removedPeers)).toBe(true);
    expect(Object.isFrozen(remainingViewer)).toBe(true);
    expect(Object.isFrozen(removedViewer)).toBe(true);
    expect(remainingViewer).toBe(removedViewer);
    expect(() => {
      leaveResult.removedPeers.push(peer({ peerId: "viewer-2", role: "viewer" }));
    }).toThrow(TypeError);
    expect(() => {
      removedViewer.peerId = "viewer-2";
    }).toThrow(TypeError);
    expect(() => {
      removedViewer.close = () => undefined;
    }).toThrow(TypeError);

    expect(removedViewer.close).toBe(viewerClose);
    expect(rooms.size("session-demo")).toBe(0);
    expect(rooms.hasPeer("session-demo", "viewer-1")).toBe(false);

    expect(
      rooms.join(joinPeer({ peerId: "host-2", role: "host", pairingCode: "999-000" }))
    ).toMatchObject({
      ticketCreated: true,
      ticketRemainingUses: 1
    });
    expect(() =>
      rooms.join(
        joinPeer({
          peerId: "viewer-1",
          role: "viewer",
          deviceId: "dev_viewer_1",
          pairingCode: "123-456"
        })
      )
    ).toThrow("Pairing code mismatch");
  });

  it("rejects viewer joins before the host creates pairing material", () => {
    const rooms = new RoomRegistry();

    expect(() =>
      rooms.join(joinPeer({ peerId: "viewer-1", role: "viewer", deviceId: "dev_viewer_1" }))
    ).toThrow("Host pairing ticket required");
    expect(rooms.size("session-demo")).toBe(0);
  });

  it("rejects mismatched viewer pairing codes before registration", () => {
    const rooms = new RoomRegistry();

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));

    expect(() =>
      rooms.join(
        joinPeer({
          peerId: "viewer-1",
          role: "viewer",
          deviceId: "dev_viewer_1",
          pairingCode: "999-000"
        })
      )
    ).toThrow("Pairing code mismatch");
    expect(rooms.size("session-demo")).toBe(1);
  });

  it("rejects expired pairing tickets before viewer registration", () => {
    let now = new Date("2026-06-11T00:00:00.000Z");
    const rooms = new RoomRegistry({
      ticketTtlMs: 10,
      maxUses: 1,
      now: () => now
    });

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));
    now = new Date("2026-06-11T00:00:00.010Z");

    expect(() =>
      rooms.join(joinPeer({ peerId: "viewer-1", role: "viewer", deviceId: "dev_viewer_1" }))
    ).toThrow("Pairing ticket is expired");
    expect(rooms.size("session-demo")).toBe(1);
  });

  it("rejects consumed pairing tickets after all uses are spent", () => {
    const rooms = new RoomRegistry({ ticketTtlMs: 60_000, maxUses: 1 });

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));
    rooms.join(joinPeer({ peerId: "viewer-1", role: "viewer", deviceId: "dev_viewer_1" }));
    rooms.leave("session-demo", "viewer-1");

    expect(() =>
      rooms.join(joinPeer({ peerId: "viewer-2", role: "viewer", deviceId: "dev_viewer_2" }))
    ).toThrow("Pairing ticket has no remaining uses");
    expect(rooms.size("session-demo")).toBe(1);
  });

  it("validates injected pairing settings before ticket creation", () => {
    expect(normalizeRelayPairingConfig()).toMatchObject({
      ticketTtlMs: 5 * 60_000,
      maxUses: 1
    });
    expect(
      normalizeRelayPairingConfig({
        ticketTtlMs: 0,
        maxUses: 10
      })
    ).toMatchObject({
      ticketTtlMs: 0,
      maxUses: 10
    });

    const unsafeConfigs: Array<Partial<RelayPairingConfig>> = [
      { ticketTtlMs: -1 },
      { ticketTtlMs: 1.5 },
      { ticketTtlMs: Number.NaN },
      { ticketTtlMs: Number.POSITIVE_INFINITY },
      { ticketTtlMs: MAX_RELAY_PAIRING_TICKET_TTL_MS + 1 },
      { ticketTtlMs: "60000" as unknown as number },
      { ticketTtlMs: null as unknown as number },
      { maxUses: 0 },
      { maxUses: 1.5 },
      { maxUses: Number.NaN },
      { maxUses: Number.POSITIVE_INFINITY },
      { maxUses: 11 },
      { maxUses: "1" as unknown as number },
      { maxUses: null as unknown as number }
    ];

    for (const config of unsafeConfigs) {
      expect(() => new RoomRegistry(config)).toThrow("Pairing ticket");
    }
  });

  it("returns an immutable pairing config snapshot", () => {
    const originalConfig: RelayPairingConfig = {
      ticketTtlMs: 1000,
      maxUses: 2
    };

    const normalizedConfig = normalizeRelayPairingConfig(originalConfig);
    originalConfig.ticketTtlMs = 0;
    originalConfig.maxUses = 10;

    expect(normalizedConfig).toMatchObject({
      ticketTtlMs: 1000,
      maxUses: 2
    });
    expect(Object.isFrozen(normalizedConfig)).toBe(true);

    try {
      normalizedConfig.ticketTtlMs = 60_000;
      normalizedConfig.maxUses = 10;
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
    }

    expect(normalizedConfig).toMatchObject({
      ticketTtlMs: 1000,
      maxUses: 2
    });
  });

  it("uses a validated pairing snapshot after caller mutates injected config", () => {
    let now = new Date("2026-06-14T00:00:00.000Z");
    const pairingConfig: RelayPairingConfig = {
      ticketTtlMs: 100,
      maxUses: 2,
      now: () => now
    };
    const rooms = new RoomRegistry(pairingConfig);

    pairingConfig.ticketTtlMs = 0;
    pairingConfig.maxUses = 1;
    pairingConfig.now = () => new Date("2026-06-14T00:01:00.000Z");

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));
    now = new Date("2026-06-14T00:00:00.050Z");
    expect(
      rooms.join(joinPeer({ peerId: "viewer-1", role: "viewer", deviceId: "dev_viewer_1" }))
    ).toMatchObject({
      ticketConsumed: true,
      ticketRemainingUses: 1
    });

    rooms.leave("session-demo", "viewer-1");
    now = new Date("2026-06-14T00:00:00.060Z");
    expect(
      rooms.join(joinPeer({ peerId: "viewer-2", role: "viewer", deviceId: "dev_viewer_2" }))
    ).toMatchObject({
      ticketConsumed: true,
      ticketRemainingUses: 0
    });
  });

  it("removes empty rooms", () => {
    const rooms = new RoomRegistry();

    rooms.join(joinPeer({ peerId: "host-1", role: "host" }));
    rooms.leave("session-demo", "host-1");

    expect(rooms.size("session-demo")).toBe(0);
  });
});
