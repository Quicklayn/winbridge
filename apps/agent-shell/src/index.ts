import { PairingCodeSchema, type SessionRole } from "@winbridge/protocol";
import { createAgentShellRuntime, parsePermissions, type HostDecision } from "./runtime.js";

type Args = {
  role: SessionRole;
  relayUrl: string;
  sessionId: string;
  pairingCode: string;
  peerId: string;
  displayName: string;
  token?: string;
  deviceId: string;
  requestedPermissions: ReturnType<typeof parsePermissions>;
  hostDecision: HostDecision;
  visibleToHost: boolean;
};

const args = parseArgs(process.argv.slice(2));
const runtime = createAgentShellRuntime(args);

const shutdown = async () => {
  await runtime.stop();
};

process.on("SIGINT", () => {
  shutdown()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
});

process.on("SIGTERM", () => {
  shutdown()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
});

runtime.start().catch((error) => {
  console.error(error);
  process.exit(1);
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
    token: options.get("token"),
    deviceId: options.get("device") ?? `dev_${role}_${process.pid}`,
    requestedPermissions: parsePermissions(options.get("request")),
    hostDecision: parseHostDecision(options.get("host-decision")),
    visibleToHost: options.get("visible-session") === "true"
  };
}

function parseHostDecision(raw: string | undefined): HostDecision {
  if (!raw) {
    return "none";
  }

  if (raw === "approve" || raw === "deny" || raw === "none") {
    return raw;
  }

  printUsageAndExit();
}

function printUsageAndExit(): never {
  console.error(
    "Usage: npm run dev:agent -- <host|viewer> [--relay ws://localhost:8787] [--session demo] [--pairing 123-456] [--peer peer-id] [--device device-id] [--name display-name] [--token token] [--request screen:view,input:pointer] [--host-decision none|approve|deny] [--visible-session true|false]"
  );
  process.exit(1);
}
