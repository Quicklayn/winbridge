import { randomBytes, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { isControlPromptCommandLineTooLong } from "./control-prompt-input.js";
import {
  parseHostControlCommand,
  runHostControlCommand,
  type HostLifecycleControlCommand
} from "./host-control-prompt.js";
import {
  createAgentShellErrorDiagnostic,
  type AgentShellHostStatusSnapshot,
  type AgentShellRuntime
} from "./runtime.js";

export type HostLocalControlSurfaceRuntime = Pick<
  AgentShellRuntime,
  "getHostStatus" | "pause" | "resume" | "revokePermission" | "terminate" | "disconnect"
>;

export type HostLocalControlSurfaceOptions = {
  port: number;
  logger?: {
    log(message: string): void;
    error(message: string): void;
  };
};

export type HostLocalControlSurfaceHandle = {
  url: string;
  port: number;
  token: string;
  stop(): Promise<void>;
};

type HostLocalSurfaceJson =
  | { ok: true; state?: LocalSurfaceHostStatus; action?: HostLifecycleControlCommand["action"] }
  | {
      ok: false;
      error: "not-found" | "method-not-allowed" | "rejected" | "failed";
      messageBytes?: number;
    };

type LocalSurfaceHostStatus = Omit<AgentShellHostStatusSnapshot, "authorizationId">;

const HOST_LOCAL_CONTROL_SURFACE_HOST = "127.0.0.1";
const HOST_LOCAL_CONTROL_SURFACE_BODY_BYTES = 256;
const HOST_LOCAL_CONTROL_SURFACE_TOKEN_BYTES = 32;
const HOST_LOCAL_CONTROL_SURFACE_TOKEN_HEADER = "x-winbridge-local-surface-token";
const HOST_LOCAL_CONTROL_SURFACE_READY_MESSAGE =
  "[winbridge-agent] host local control surface";

export async function startHostLocalControlSurface(
  runtime: HostLocalControlSurfaceRuntime,
  options: HostLocalControlSurfaceOptions
): Promise<HostLocalControlSurfaceHandle> {
  assertHostLocalControlSurfacePort(options.port, true);

  let localOrigin: string | undefined;
  let stopRequested = false;
  const token = createHostLocalControlSurfaceToken();
  const server = createServer({ requireHostHeader: false }, (request, response) => {
    void handleHostLocalControlSurfaceRequest(
      runtime,
      token,
      () => localOrigin,
      () => {
        if (stopRequested) {
          return;
        }
        stopRequested = true;
        setImmediate(() => {
          void closeServer(server);
        });
      },
      request,
      response
    );
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, HOST_LOCAL_CONTROL_SURFACE_HOST, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    await closeServer(server);
    throw new Error("Host local control surface did not expose a TCP address");
  }

  localOrigin = `http://${HOST_LOCAL_CONTROL_SURFACE_HOST}:${address.port}`;
  const url = `${localOrigin}/`;
  options.logger?.log(`${HOST_LOCAL_CONTROL_SURFACE_READY_MESSAGE} url=${url}`);

  return {
    url,
    port: address.port,
    token,
    stop: () => closeServer(server)
  };
}

export function assertHostLocalControlSurfacePort(
  value: unknown,
  allowEphemeralPort = false
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < (allowEphemeralPort ? 0 : 1024) ||
    value > 65535
  ) {
    throw new Error(
      allowEphemeralPort
        ? "Host local control surface port must be 0 or an integer from 1024 through 65535"
        : "Host local control surface port must be an integer from 1024 through 65535"
    );
  }
}

async function handleHostLocalControlSurfaceRequest(
  runtime: HostLocalControlSurfaceRuntime,
  token: string,
  getLocalOrigin: () => string | undefined,
  requestStop: () => void,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const requestUrl = parseRequestUrl(request);
  if (!requestUrl) {
    writeJson(response, 404, { ok: false, error: "not-found" });
    return;
  }

  try {
    if (!isHostLocalRequestHostAllowed(request, getLocalOrigin())) {
      writeJson(response, 403, { ok: false, error: "rejected" });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/") {
      const nonce = createHostLocalControlSurfaceNonce();
      writeHtml(response, renderHostLocalControlSurfaceHtml(token, nonce), nonce);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/status") {
      writeJson(response, 200, {
        ok: true,
        state: sanitizeHostStatus(runtime.getHostStatus())
      });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/control") {
      if (!isHostLocalMutationRequestAllowed(request, token, getLocalOrigin())) {
        writeJson(response, 403, { ok: false, error: "rejected" });
        return;
      }
      await handleControlRequest(runtime, requestStop, request, response);
      return;
    }

    if (["GET", "POST"].includes(request.method ?? "")) {
      writeJson(response, 404, { ok: false, error: "not-found" });
      return;
    }

    writeJson(response, 405, { ok: false, error: "method-not-allowed" });
  } catch (error) {
    const diagnostic = createAgentShellErrorDiagnostic(error);
    writeJson(response, 500, { ok: false, error: "failed", messageBytes: diagnostic.messageBytes });
  }
}

function createHostLocalControlSurfaceToken(): string {
  return randomBytes(HOST_LOCAL_CONTROL_SURFACE_TOKEN_BYTES).toString("base64url");
}

function createHostLocalControlSurfaceNonce(): string {
  return randomBytes(16).toString("base64url");
}

function isHostLocalMutationRequestAllowed(
  request: IncomingMessage,
  expectedToken: string,
  localOrigin: string | undefined
): boolean {
  if (!localOrigin || request.headers.origin !== localOrigin) {
    return false;
  }

  if (!isJsonContentType(request.headers["content-type"])) {
    return false;
  }

  const token = getSingleHeaderValue(request.headers[HOST_LOCAL_CONTROL_SURFACE_TOKEN_HEADER]);
  return token !== undefined && safeTokenEquals(token, expectedToken);
}

function isHostLocalRequestHostAllowed(
  request: IncomingMessage,
  localOrigin: string | undefined
): boolean {
  if (!localOrigin) {
    return false;
  }

  const host = getSingleHeaderValue(request.headers.host);
  return typeof host === "string" && host.toLowerCase() === new URL(localOrigin).host;
}

function isJsonContentType(value: string | string[] | undefined): boolean {
  const contentType = getSingleHeaderValue(value);
  return contentType?.toLowerCase().split(";", 1)[0]?.trim() === "application/json";
}

function getSingleHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? undefined : value;
}

function safeTokenEquals(value: string, expected: string): boolean {
  if (value.length > 256) {
    return false;
  }

  const valueBuffer = Buffer.from(value, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return (
    valueBuffer.byteLength === expectedBuffer.byteLength &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  );
}

async function handleControlRequest(
  runtime: HostLocalControlSurfaceRuntime,
  requestStop: () => void,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const body = await readBoundedRequestBody(request);
  if (body === undefined) {
    writeJson(response, 413, { ok: false, error: "rejected" });
    return;
  }

  const commandLine = parseControlCommandBody(body);
  if (
    commandLine === undefined ||
    isControlPromptCommandLineTooLong(commandLine)
  ) {
    writeJson(response, 400, { ok: false, error: "rejected" });
    return;
  }

  const command = parseHostControlCommand(commandLine);
  if (!command || command.action === "help" || command.action === "status") {
    writeJson(response, 400, { ok: false, error: "rejected" });
    return;
  }

  try {
    runHostControlCommand(runtime, command);
    writeJson(response, 202, { ok: true, action: command.action });
    if (command.action === "disconnect" || command.action === "terminate") {
      requestStop();
    }
  } catch (error) {
    const diagnostic = createAgentShellErrorDiagnostic(error);
    writeJson(response, 409, { ok: false, error: "failed", messageBytes: diagnostic.messageBytes });
  }
}

function parseControlCommandBody(body: string): string | undefined {
  let parsed: unknown;

  try {
    parsed = JSON.parse(body);
  } catch {
    return undefined;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed) ||
    Object.keys(parsed).length !== 1
  ) {
    return undefined;
  }

  const command = (parsed as { command?: unknown }).command;
  return typeof command === "string" ? command : undefined;
}

async function readBoundedRequestBody(request: IncomingMessage): Promise<string | undefined> {
  const chunks: Buffer[] = [];
  let byteLength = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    byteLength += buffer.byteLength;
    if (byteLength > HOST_LOCAL_CONTROL_SURFACE_BODY_BYTES) {
      return undefined;
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function parseRequestUrl(request: IncomingMessage): URL | undefined {
  if (!request.url) {
    return undefined;
  }

  try {
    return new URL(request.url, `http://${HOST_LOCAL_CONTROL_SURFACE_HOST}`);
  } catch {
    return undefined;
  }
}

function sanitizeHostStatus(status: AgentShellHostStatusSnapshot): LocalSurfaceHostStatus {
  const { authorizationId: _authorizationId, ...sanitized } = status;
  return sanitized;
}

function writeHtml(response: ServerResponse, html: string, nonce: string): void {
  response.writeHead(200, {
    "cache-control": "no-store",
    "content-security-policy": createHostLocalControlSurfaceContentSecurityPolicy(nonce),
    "content-type": "text/html; charset=utf-8",
    "x-content-type-options": "nosniff"
  });
  response.end(html);
}

function createHostLocalControlSurfaceContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'none'",
    "base-uri 'none'",
    "connect-src 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    `script-src 'nonce-${nonce}'`,
    `style-src 'nonce-${nonce}'`
  ].join("; ");
}

function writeJson(response: ServerResponse, statusCode: number, body: HostLocalSurfaceJson): void {
  const serialized = JSON.stringify(body);
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(serialized, "utf8"),
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff"
  });
  response.end(serialized);
}

function renderHostLocalControlSurfaceHtml(token: string, nonce: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WinBridge Host</title>
  <style nonce="${nonce}">
    :root { color-scheme: light dark; font-family: Segoe UI, Arial, sans-serif; }
    body { margin: 0; background: #111827; color: #f9fafb; }
    main { min-height: 100vh; display: grid; grid-template-rows: auto 1fr; }
    header { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 12px 16px; background: #1f2937; }
    section { display: grid; align-content: start; gap: 16px; padding: 16px; }
    .controls { display: flex; flex-wrap: wrap; gap: 8px; }
    button { min-width: 96px; padding: 8px 10px; border: 1px solid #4b5563; border-radius: 4px; background: #374151; color: #f9fafb; font: inherit; }
    button.danger { background: #7f1d1d; border-color: #ef4444; }
    #status, #result { color: #d1d5db; overflow-wrap: anywhere; }
  </style>
</head>
<body>
  <main>
    <header>
      <strong>WinBridge Host</strong>
      <span id="result">control=ready</span>
    </header>
    <section>
      <div id="status">status=pending</div>
      <div class="controls" aria-label="Host controls">
        <button type="button" data-command="pause">Pause</button>
        <button type="button" data-command="resume">Resume</button>
        <button type="button" data-command="revoke screen:view">Revoke Screen</button>
        <button type="button" data-command="revoke input:pointer">Revoke Pointer</button>
        <button type="button" data-command="revoke input:keyboard">Revoke Keyboard</button>
        <button class="danger" type="button" data-command="terminate">Terminate</button>
        <button class="danger" type="button" data-command="disconnect">Disconnect</button>
      </div>
    </section>
  </main>
  <script nonce="${nonce}">
    const status = document.getElementById("status");
    const result = document.getElementById("result");
    const mutationToken = ${JSON.stringify(token)};

    async function refreshStatus() {
      const response = await fetch("/status", { cache: "no-store" });
      const body = await response.json().catch(() => ({ ok: false }));
      if (!body.ok || !body.state) {
        status.textContent = "status=not-ready";
        return;
      }
      const state = body.state;
      const parts = [
        "state=" + state.state,
        "visibleToHost=" + state.visibleToHost,
        "permissionCount=" + state.permissionCount
      ];
      if (state.authorizationStatus) parts.push("authorizationStatus=" + state.authorizationStatus);
      if (state.expiresAt) parts.push("expiresAt=" + state.expiresAt);
      if (state.viewerDeviceId) parts.push("viewerDeviceId=" + state.viewerDeviceId);
      if (state.viewerDevicePlatform) parts.push("viewerDevicePlatform=" + state.viewerDevicePlatform);
      if (state.inactiveCause) parts.push("inactiveCause=" + state.inactiveCause);
      if (state.remoteDisconnectReasonCode) parts.push("remoteDisconnectReasonCode=" + state.remoteDisconnectReasonCode);
      status.textContent = parts.join(" ");
    }

    async function sendControl(command) {
      const response = await fetch("/control", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "${HOST_LOCAL_CONTROL_SURFACE_TOKEN_HEADER}": mutationToken
        },
        body: JSON.stringify({ command })
      });
      const body = await response.json().catch(() => ({ ok: false, error: "failed" }));
      result.textContent = body.ok ? "control=accepted action=" + body.action : "control=" + body.error;
      await refreshStatus();
    }

    for (const button of document.querySelectorAll("[data-command]")) {
      button.addEventListener("click", () => {
        const command = button.getAttribute("data-command");
        if (typeof command === "string") void sendControl(command);
      });
    }

    setInterval(refreshStatus, 1000);
    void refreshStatus();
  </script>
</body>
</html>`;
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
