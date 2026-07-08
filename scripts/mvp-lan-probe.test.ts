import { once } from "node:events";
import { describe, expect, it } from "vitest";
import WebSocket, { WebSocketServer } from "ws";
import {
  formatMvpLanProbeError,
  formatMvpLanProbeSuccess,
  MvpLanProbeUsageError,
  parseMvpLanProbeArgs,
  resolveMvpLanProbeTokenEnv,
  runMvpLanProbe
} from "./mvp-lan-probe.mjs";

const baseArgs = [
  "--role",
  "host",
  "--relay",
  "ws://127.0.0.1:8787/",
  "--session",
  "probe-demo",
  "--pairing",
  "123-456",
  "--peer",
  "host-probe",
  "--device",
  "host-device"
];

describe("MVP LAN probe", () => {
  it("parses explicit bounded probe options", () => {
    expect(parseMvpLanProbeArgs(baseArgs)).toMatchObject({
      help: false,
      json: false,
      role: "host",
      relay: "ws://127.0.0.1:8787/",
      session: "probe-demo",
      pairing: "123-456",
      peer: "host-probe",
      device: "host-device",
      timeoutMs: 15000
    });
    expect(
      parseMvpLanProbeArgs([
        ...baseArgs,
        "--timeout-ms",
        "5000",
        "--token-env",
        "WINBRIDGE_RELAY_SHARED_TOKEN",
        "--json"
      ])
    ).toMatchObject({
      timeoutMs: 5000,
      tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN",
      json: true
    });
    expect(
      parseMvpLanProbeArgs([
        "--role",
        "viewer",
        "--relay-host",
        "192.168.1.10",
        "--session",
        "probe-demo",
        "--pairing",
        "123-456",
        "--peer",
        "viewer-probe",
        "--device",
        "viewer-device"
      ])
    ).toMatchObject({
      role: "viewer",
      relay: "ws://192.168.1.10:8787/",
      session: "probe-demo"
    });
    expect(parseMvpLanProbeArgs(["--help"])).toEqual({ help: true });
  });

  it("rejects malformed options without echoing unsafe values", () => {
    let thrown: unknown;
    try {
      parseMvpLanProbeArgs(["--role", "viewer", "--relay", "ws://token-secret.invalid:8787/"]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(MvpLanProbeUsageError);
    expect(formatMvpLanProbeError(thrown)).not.toContain("token-secret");

    const malformedCases = [
      [],
      ["--role", "host"],
      [...baseArgs, "--role", "host"],
      [...baseArgs, "--role", "viewer"],
      [...baseArgs, "--relay", "http://127.0.0.1:8787/"],
      [...baseArgs, "--relay", "ws://127.0.0.1:8787/path"],
      [...baseArgs, "--relay", "ws://user:pass@127.0.0.1:8787/"],
      [...baseArgs, "--relay", "ws://127.0.0.1:8787/?token=secret"],
      [...baseArgs, "--relay", "ws://0.0.0.0:8787/"],
      [...baseArgs, "--relay", "ws://999.1.1.1:8787/"],
      [...baseArgs, "--relay-host", "192.168.1.10"],
      baseArgs.filter((_, index) => index !== 2 && index !== 3),
      [
        "--role",
        "host",
        "--relay-host",
        "localhost",
        "--session",
        "probe-demo",
        "--pairing",
        "123-456",
        "--peer",
        "host-probe",
        "--device",
        "host-device"
      ],
      [
        "--role",
        "host",
        "--relay-host",
        "127.0.0.1",
        "--session",
        "probe-demo",
        "--pairing",
        "123-456",
        "--peer",
        "host-probe",
        "--device",
        "host-device"
      ],
      [
        "--role",
        "host",
        "--relay-host",
        "0.0.0.0",
        "--session",
        "probe-demo",
        "--pairing",
        "123-456",
        "--peer",
        "host-probe",
        "--device",
        "host-device"
      ],
      [
        "--role",
        "host",
        "--relay-host",
        "999.1.1.1",
        "--session",
        "probe-demo",
        "--pairing",
        "123-456",
        "--peer",
        "host-probe",
        "--device",
        "host-device"
      ],
      [
        "--role",
        "host",
        "--relay-host",
        "raw-secret-token",
        "--session",
        "probe-demo",
        "--pairing",
        "123-456",
        "--peer",
        "host-probe",
        "--device",
        "host-device"
      ],
      [...baseArgs, "--session", "token-secret"],
      [...baseArgs, "--pairing", "123456"],
      [...baseArgs, "--peer", "x"],
      [...baseArgs, "--device", "device\u200Bsafe"],
      [...baseArgs, "--timeout-ms", "999"],
      [...baseArgs, "--timeout-ms", "60001"],
      [...baseArgs, "--token-env"],
      [...baseArgs, "--token-env", "relay-token"],
      [...baseArgs, "--json", "--json"],
      [...baseArgs, "raw-secret-token"]
    ];

    for (const args of malformedCases) {
      expect(() => parseMvpLanProbeArgs(args)).toThrow(MvpLanProbeUsageError);
    }
  });

  it("resolves token env values without printing token contents", () => {
    expect(
      resolveMvpLanProbeTokenEnv(
        { WINBRIDGE_RELAY_SHARED_TOKEN: "dev-shared-token" },
        "WINBRIDGE_RELAY_SHARED_TOKEN"
      )
    ).toBe("dev-shared-token");
    expect(resolveMvpLanProbeTokenEnv({}, undefined)).toBeUndefined();

    for (const env of [
      {},
      { WINBRIDGE_RELAY_SHARED_TOKEN: "" },
      { WINBRIDGE_RELAY_SHARED_TOKEN: " raw-secret-token" },
      { WINBRIDGE_RELAY_SHARED_TOKEN: "raw-secret-token\n" },
      { WINBRIDGE_RELAY_SHARED_TOKEN: "x".repeat(1025) },
      { WINBRIDGE_RELAY_SHARED_TOKEN: "safe\u200Btoken" }
    ]) {
      let thrown: unknown;
      try {
        resolveMvpLanProbeTokenEnv(env, "WINBRIDGE_RELAY_SHARED_TOKEN");
      } catch (error) {
        thrown = error;
      }
      expect(formatMvpLanProbeError(thrown)).toBe(
        "WinBridge MVP LAN probe failed. reason=token-env-missing\n"
      );
      expect(formatMvpLanProbeError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpLanProbeError(thrown, { json: true })).not.toContain("raw-secret-token");
      expect(formatMvpLanProbeError(thrown)).not.toContain("safe\u200Btoken");
    }
  });

  it("formats bounded success and JSON output", () => {
    const success = {
      ok: true,
      role: "viewer",
      checks: [
        { name: "connect", ok: true },
        { name: "join", ok: true },
        { name: "paired", ok: true }
      ]
    };
    const text = formatMvpLanProbeSuccess(success);
    const json = JSON.parse(formatMvpLanProbeSuccess(success, { json: true }));

    expect(text).toContain("WinBridge MVP LAN probe passed.");
    expect(text).toContain("role=viewer");
    expect(text).toContain("paired=verified");
    expect(text).not.toContain("123-456");
    expect(text).not.toContain("ws://");
    expect(json).toEqual({
      ok: true,
      role: "viewer",
      checks: [
        { name: "connect", ok: true },
        { name: "join", ok: true },
        { name: "paired", ok: true }
      ]
    });
  });

  it("runs two opposite probes to paired readiness", async () => {
    const server = await startProbeRelayServer();
    try {
      const common = {
        relay: server.url,
        session: "probe-demo",
        pairing: "123-456",
        timeoutMs: 5000
      };
      const [host, viewer] = await Promise.all([
        runMvpLanProbe({
          ...common,
          role: "host",
          peer: "host-probe",
          device: "host-device"
        }),
        runMvpLanProbe({
          ...common,
          role: "viewer",
          peer: "viewer-probe",
          device: "viewer-device"
        })
      ]);

      expect(host).toMatchObject({ ok: true, role: "host" });
      expect(viewer).toMatchObject({ ok: true, role: "viewer" });
      expect(server.received.map((message) => message.type)).toEqual(["join-session", "join-session"]);
      expect(JSON.stringify(server.received)).not.toContain("hello");
      expect(JSON.stringify(server.received)).not.toContain("screen-frame");
      expect(JSON.stringify(server.received)).not.toContain("input-event");
    } finally {
      await server.close();
    }
  });

  it("fails closed on relay-error and timeout with bounded diagnostics", async () => {
    const errorServer = await startFixedMessageServer({
      protocolVersion: 1,
      type: "relay-error",
      reason: "Pairing code mismatch",
      messageId: "relay-error-message",
      sessionId: "probe-demo",
      createdAt: new Date().toISOString()
    });
    try {
      await expect(
        runMvpLanProbe({
          role: "host",
          relay: errorServer.url,
          session: "probe-demo",
          pairing: "123-456",
          peer: "host-probe",
          device: "host-device",
          timeoutMs: 1000
        })
      ).rejects.toMatchObject({ reason: "relay-error" });
    } finally {
      await errorServer.close();
    }

    const idleServer = await startFixedMessageServer(undefined);
    try {
      let thrown: unknown;
      try {
        await runMvpLanProbe({
          role: "host",
          relay: idleServer.url,
          session: "probe-demo",
          pairing: "123-456",
          peer: "host-probe",
          device: "host-device",
          timeoutMs: 1000
        });
      } catch (error) {
        thrown = error;
      }
      expect(formatMvpLanProbeError(thrown)).toBe("WinBridge MVP LAN probe failed. reason=timeout\n");
      expect(formatMvpLanProbeError(thrown)).not.toContain("123-456");
      expect(formatMvpLanProbeError(thrown)).not.toContain(idleServer.url);
    } finally {
      await idleServer.close();
    }
  });
});

async function startProbeRelayServer() {
  const server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  const peers: Array<{ socket: WebSocket; message: any }> = [];
  const received: any[] = [];
  server.on("connection", (socket) => {
    socket.on("message", (raw) => {
      const message = JSON.parse(String(raw));
      received.push(message);
      peers.push({ socket, message });
      if (peers.length === 2) {
        for (const peer of peers) {
          peer.socket.send(
            JSON.stringify({
              protocolVersion: 1,
              messageId: `relay-ready-${peer.message.peerId}`,
              sessionId: peer.message.sessionId,
              createdAt: new Date().toISOString(),
              type: "relay-ready",
              peerId: peer.message.peerId,
              roomSize: 2
            })
          );
        }
      } else {
        socket.send(
          JSON.stringify({
            protocolVersion: 1,
            messageId: `relay-ready-${message.peerId}`,
            sessionId: message.sessionId,
            createdAt: new Date().toISOString(),
            type: "relay-ready",
            peerId: message.peerId,
            roomSize: 1
          })
        );
      }
    });
  });
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("probe test server did not expose a TCP port");
  }
  return {
    url: `ws://127.0.0.1:${address.port}/`,
    received,
    close: () => closeServer(server)
  };
}

async function startFixedMessageServer(message: any | undefined) {
  const server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  server.on("connection", (socket) => {
    socket.on("message", () => {
      if (message) {
        socket.send(JSON.stringify(message));
      }
    });
  });
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("fixed-message test server did not expose a TCP port");
  }
  return {
    url: `ws://127.0.0.1:${address.port}/`,
    close: () => closeServer(server)
  };
}

function closeServer(server: WebSocketServer): Promise<void> {
  for (const client of server.clients) {
    client.close();
  }
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
