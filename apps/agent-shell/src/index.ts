import WebSocket from "ws";
import {
  createMessageBase,
  decodeProtocolEnvelope,
  encodeProtocolEnvelope,
  PairingCodeSchema,
  type SessionRole
} from "@winbridge/protocol";

type Args = {
  role: SessionRole;
  relayUrl: string;
  sessionId: string;
  pairingCode: string;
  peerId: string;
  displayName: string;
  token?: string;
};

const args = parseArgs(process.argv.slice(2));
const relayUrl = new URL(args.relayUrl);

if (args.token) {
  relayUrl.searchParams.set("token", args.token);
}

const socket = new WebSocket(relayUrl);

socket.on("open", () => {
  console.log(`[winbridge-agent] ${args.role} connected to ${relayUrl.origin}`);
  console.log("[winbridge-agent] Native screen capture and remote input are not implemented.");
  console.log("[winbridge-agent] This shell only exercises the consent/session protocol.");

  socket.send(
    encodeProtocolEnvelope({
      ...createMessageBase(args.sessionId),
      type: "join-session",
      peerId: args.peerId,
      role: args.role,
      pairingCode: args.pairingCode
    })
  );

  socket.send(
    encodeProtocolEnvelope({
      ...createMessageBase(args.sessionId),
      type: "hello",
      peerId: args.peerId,
      role: args.role,
      displayName: args.displayName,
      capabilities: ["session:visible", "consent:required", "audit:stdout"]
    })
  );
});

socket.on("message", (data) => {
  const text = data.toString();

  try {
    const envelope = decodeProtocolEnvelope(text);
    console.log("[winbridge-agent] received", JSON.stringify(envelope, null, 2));
  } catch {
    console.log("[winbridge-agent] received non-protocol message", text);
  }
});

socket.on("close", (code, reason) => {
  console.log(`[winbridge-agent] disconnected code=${code} reason=${reason.toString()}`);
});

socket.on("error", (error) => {
  console.error("[winbridge-agent] socket error", error.message);
});

function parseArgs(raw: string[]): Args {
  const role = raw[0] as SessionRole | undefined;

  if (role !== "host" && role !== "viewer") {
    printUsageAndExit();
  }

  const options = new Map<string, string>();

  for (let index = 1; index < raw.length; index += 2) {
    const key = raw[index];
    const value = raw[index + 1];

    if (!key?.startsWith("--") || !value) {
      printUsageAndExit();
    }

    options.set(key.slice(2), value);
  }

  const sessionId = options.get("session") ?? "demo";
  const pairingCode = options.get("pairing") ?? "123-456";
  PairingCodeSchema.parse(pairingCode);

  return {
    role,
    relayUrl: options.get("relay") ?? "ws://localhost:8787",
    sessionId,
    pairingCode,
    peerId: options.get("peer") ?? `${role}-${process.pid}`,
    displayName: options.get("name") ?? `${role} ${process.pid}`,
    token: options.get("token")
  };
}

function printUsageAndExit(): never {
  console.error(
    "Usage: npm run dev:agent -- <host|viewer> [--relay ws://localhost:8787] [--session demo] [--pairing 123-456] [--peer peer-id] [--name display-name] [--token token]"
  );
  process.exit(1);
}
