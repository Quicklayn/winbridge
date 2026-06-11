import { createServer } from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import {
  createMessageBase,
  decodeProtocolEnvelope,
  encodeProtocolEnvelope,
  JoinSessionMessageSchema,
  type ProtocolEnvelope
} from "@winbridge/protocol";
import { RoomRegistry, type RelayPeer } from "./rooms.js";

const port = Number.parseInt(process.env.WINBRIDGE_RELAY_PORT ?? "8787", 10);
const sharedToken = process.env.WINBRIDGE_RELAY_SHARED_TOKEN;
const rooms = new RoomRegistry();

if (!sharedToken) {
  console.warn(
    "[winbridge-relay] Development mode: WINBRIDGE_RELAY_SHARED_TOKEN is not set. Do not use this as production authorization."
  );
}

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (socket, request) => {
  const requestUrl = new URL(request.url ?? "/", "ws://localhost");
  const token = requestUrl.searchParams.get("token");

  if (sharedToken && token !== sharedToken) {
    socket.close(1008, "Invalid relay token");
    return;
  }

  let registeredPeer: RelayPeer | undefined;

  socket.on("message", (data) => {
    try {
      const envelope = decodeProtocolEnvelope(data.toString());

      if (!registeredPeer) {
        registeredPeer = registerFirstMessage(envelope, (payload) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(payload);
          }
        });

        const ready = encodeProtocolEnvelope({
          ...createMessageBase(registeredPeer.sessionId),
          type: "relay-ready",
          peerId: registeredPeer.peerId,
          roomSize: rooms.size(registeredPeer.sessionId)
        });
        socket.send(ready);
        return;
      }

      if (envelope.sessionId !== registeredPeer.sessionId) {
        throw new Error("Message session does not match registered peer");
      }

      for (const peer of rooms.peers(registeredPeer.sessionId, registeredPeer.peerId)) {
        peer.send(encodeProtocolEnvelope(envelope));
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Invalid relay message";
      socket.send(
        JSON.stringify({
          type: "relay-error",
          reason
        })
      );
    }
  });

  socket.on("close", () => {
    if (registeredPeer) {
      rooms.leave(registeredPeer.sessionId, registeredPeer.peerId);
    }
  });
});

server.listen(port, () => {
  console.log(`[winbridge-relay] Listening on ws://localhost:${port}`);
});

function registerFirstMessage(envelope: ProtocolEnvelope, send: (data: string) => void): RelayPeer {
  const join = JoinSessionMessageSchema.parse(envelope);
  const peer: RelayPeer = {
    peerId: join.peerId,
    role: join.role,
    sessionId: join.sessionId,
    pairingCode: join.pairingCode,
    send
  };

  const peers = rooms.join(peer);
  const mismatch = peers.find((existing) => existing.pairingCode !== peer.pairingCode);

  if (mismatch) {
    rooms.leave(peer.sessionId, peer.peerId);
    throw new Error("Pairing code mismatch");
  }

  return peer;
}
