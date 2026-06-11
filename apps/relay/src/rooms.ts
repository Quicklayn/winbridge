import type { SessionRole } from "@winbridge/protocol";

export type RelayPeer = {
  peerId: string;
  role: SessionRole;
  sessionId: string;
  pairingCode: string;
  send: (data: string) => void;
};

export class RoomRegistry {
  private readonly rooms = new Map<string, Map<string, RelayPeer>>();

  join(peer: RelayPeer): RelayPeer[] {
    const room = this.rooms.get(peer.sessionId) ?? new Map<string, RelayPeer>();
    const sameRole = [...room.values()].find((existing) => existing.role === peer.role);

    if (sameRole && sameRole.peerId !== peer.peerId) {
      throw new Error(`A ${peer.role} is already connected to session ${peer.sessionId}`);
    }

    if (room.size >= 2 && !room.has(peer.peerId)) {
      throw new Error(`Session ${peer.sessionId} already has two peers`);
    }

    room.set(peer.peerId, peer);
    this.rooms.set(peer.sessionId, room);
    return [...room.values()];
  }

  leave(sessionId: string, peerId: string): void {
    const room = this.rooms.get(sessionId);
    if (!room) {
      return;
    }

    room.delete(peerId);

    if (room.size === 0) {
      this.rooms.delete(sessionId);
    }
  }

  peers(sessionId: string, exceptPeerId?: string): RelayPeer[] {
    const room = this.rooms.get(sessionId);

    if (!room) {
      return [];
    }

    return [...room.values()].filter((peer) => peer.peerId !== exceptPeerId);
  }

  size(sessionId: string): number {
    return this.rooms.get(sessionId)?.size ?? 0;
  }
}
