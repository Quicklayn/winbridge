import { randomBytes, timingSafeEqual } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { extname } from "node:path";
import { isControlPromptCommandLineTooLong } from "./control-prompt-input.js";
import {
  createAgentShellErrorDiagnostic,
  type AgentShellRuntime,
  type AgentShellViewerStatusSnapshot
} from "./runtime.js";
import {
  parseViewerControlCommand,
  sendViewerControlInputEvent,
  type ViewerControlRuntime
} from "./viewer-control-prompt.js";

export type ViewerLocalControlSurfaceRuntime = Pick<
  AgentShellRuntime,
  "getViewerStatus" | "leave" | "sendInputEvent"
>;

export type ViewerLocalControlSurfaceOptions = {
  port: number;
  framePath: string;
  logger?: {
    log(message: string): void;
    error(message: string): void;
  };
};

export type ViewerLocalControlSurfaceHandle = {
  url: string;
  port: number;
  token: string;
  stop(): Promise<void>;
};

type LocalSurfaceJson =
  | { ok: true; state?: LocalSurfaceViewerStatus; action?: "input" | "disconnect"; kind?: string }
  | { ok: false; error: "not-found" | "method-not-allowed" | "rejected" | "failed" | "not-ready"; messageBytes?: number };

type LocalSurfaceViewerStatus = Omit<AgentShellViewerStatusSnapshot, "authorizationId">;

const VIEWER_LOCAL_CONTROL_SURFACE_HOST = "127.0.0.1";
const VIEWER_LOCAL_CONTROL_SURFACE_BODY_BYTES = 1024;
const VIEWER_LOCAL_CONTROL_SURFACE_TOKEN_BYTES = 32;
const VIEWER_LOCAL_CONTROL_SURFACE_TOKEN_HEADER = "x-winbridge-local-surface-token";
const VIEWER_LOCAL_CONTROL_SURFACE_READY_MESSAGE =
  "[winbridge-agent] viewer local control surface";
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff] as const;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

export async function startViewerLocalControlSurface(
  runtime: ViewerLocalControlSurfaceRuntime,
  options: ViewerLocalControlSurfaceOptions
): Promise<ViewerLocalControlSurfaceHandle> {
  assertViewerLocalControlSurfacePort(options.port, true);
  await clearViewerLocalControlSurfaceFrame(options.framePath);

  let nextInputSequence = 0;
  let localOrigin: string | undefined;
  const token = createViewerLocalControlSurfaceToken();
  const server = createServer((request, response) => {
    void handleViewerLocalControlSurfaceRequest(
      runtime,
      options.framePath,
      token,
      () => localOrigin,
      () => nextInputSequence++,
      request,
      response
    );
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, VIEWER_LOCAL_CONTROL_SURFACE_HOST, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    await closeServer(server);
    throw new Error("Viewer local control surface did not expose a TCP address");
  }

  localOrigin = `http://${VIEWER_LOCAL_CONTROL_SURFACE_HOST}:${address.port}`;
  const url = `${localOrigin}/`;
  options.logger?.log(`${VIEWER_LOCAL_CONTROL_SURFACE_READY_MESSAGE} url=${url}`);

  return {
    url,
    port: address.port,
    token,
    stop: () => closeServer(server)
  };
}

export function assertViewerLocalControlSurfacePort(
  value: unknown,
  allowEphemeralPort = false
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < (allowEphemeralPort ? 0 : 1024) ||
    value > 65535
  ) {
    throw new Error("Viewer local control surface port must be an integer from 1024 through 65535");
  }
}

async function handleViewerLocalControlSurfaceRequest(
  runtime: ViewerControlRuntime,
  framePath: string,
  token: string,
  getLocalOrigin: () => string | undefined,
  allocateInputSequence: () => number,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const requestUrl = parseRequestUrl(request);
  if (!requestUrl) {
    writeJson(response, 404, { ok: false, error: "not-found" });
    return;
  }

  try {
    if (request.method === "GET" && requestUrl.pathname === "/") {
      const nonce = createViewerLocalControlSurfaceNonce();
      writeHtml(response, renderViewerLocalControlSurfaceHtml(token, nonce), nonce);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/status") {
      writeJson(response, 200, {
        ok: true,
        state: sanitizeViewerStatus(runtime.getViewerStatus())
      });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/frame") {
      await writeFrame(response, framePath);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/input") {
      if (!isViewerLocalMutationRequestAllowed(request, token, getLocalOrigin())) {
        writeJson(response, 403, { ok: false, error: "rejected" });
        return;
      }
      await handleInputRequest(runtime, allocateInputSequence, request, response);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/disconnect") {
      if (!isViewerLocalMutationRequestAllowed(request, token, getLocalOrigin())) {
        writeJson(response, 403, { ok: false, error: "rejected" });
        return;
      }
      await handleDisconnectRequest(runtime, response);
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

async function clearViewerLocalControlSurfaceFrame(framePath: string): Promise<void> {
  try {
    await unlink(framePath);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return;
    }

    throw new Error("Viewer local control surface could not clear stale frame");
  }
}

function createViewerLocalControlSurfaceToken(): string {
  return randomBytes(VIEWER_LOCAL_CONTROL_SURFACE_TOKEN_BYTES).toString("base64url");
}

function createViewerLocalControlSurfaceNonce(): string {
  return randomBytes(16).toString("base64url");
}

function isViewerLocalMutationRequestAllowed(
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

  const token = getSingleHeaderValue(request.headers[VIEWER_LOCAL_CONTROL_SURFACE_TOKEN_HEADER]);
  return token !== undefined && safeTokenEquals(token, expectedToken);
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

async function handleInputRequest(
  runtime: ViewerControlRuntime,
  allocateInputSequence: () => number,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const body = await readBoundedRequestBody(request);
  if (body === undefined) {
    writeJson(response, 413, { ok: false, error: "rejected" });
    return;
  }

  const commandLine = parseInputCommandBody(body);
  if (
    commandLine === undefined ||
    isControlPromptCommandLineTooLong(commandLine)
  ) {
    writeJson(response, 400, { ok: false, error: "rejected" });
    return;
  }

  const command = parseViewerControlCommand(commandLine);
  if (!command || command.action !== "input") {
    writeJson(response, 400, { ok: false, error: "rejected" });
    return;
  }

  try {
    const accepted = sendViewerControlInputEvent(
      runtime,
      command.event,
      allocateInputSequence
    );
    writeJson(response, 202, { ok: true, action: accepted.action, kind: accepted.kind });
  } catch (error) {
    const diagnostic = createAgentShellErrorDiagnostic(error);
    writeJson(response, 409, { ok: false, error: "not-ready", messageBytes: diagnostic.messageBytes });
  }
}

async function handleDisconnectRequest(
  runtime: Pick<ViewerControlRuntime, "leave">,
  response: ServerResponse
): Promise<void> {
  try {
    await runtime.leave();
    writeJson(response, 202, { ok: true, action: "disconnect" });
  } catch (error) {
    const diagnostic = createAgentShellErrorDiagnostic(error);
    writeJson(response, 500, { ok: false, error: "failed", messageBytes: diagnostic.messageBytes });
  }
}

async function writeFrame(response: ServerResponse, framePath: string): Promise<void> {
  try {
    const frame = await readFile(framePath);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-length": frame.byteLength,
      "content-type": contentTypeForFrame(frame, framePath),
      "x-content-type-options": "nosniff"
    });
    response.end(frame);
  } catch {
    writeJson(response, 404, { ok: false, error: "not-ready" });
  }
}

function contentTypeForFrame(frame: Buffer, framePath: string): "image/jpeg" | "image/png" {
  if (hasSignature(frame, JPEG_SIGNATURE)) {
    return "image/jpeg";
  }

  if (hasSignature(frame, PNG_SIGNATURE)) {
    return "image/png";
  }

  const extension = extname(framePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  return "image/png";
}

function hasSignature(frame: Buffer, signature: readonly number[]): boolean {
  if (frame.byteLength < signature.length) {
    return false;
  }

  return signature.every((byte, index) => frame[index] === byte);
}

function parseInputCommandBody(body: string): string | undefined {
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
    if (byteLength > VIEWER_LOCAL_CONTROL_SURFACE_BODY_BYTES) {
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
    return new URL(request.url, `http://${VIEWER_LOCAL_CONTROL_SURFACE_HOST}`);
  } catch {
    return undefined;
  }
}

function sanitizeViewerStatus(status: AgentShellViewerStatusSnapshot): LocalSurfaceViewerStatus {
  const { authorizationId: _authorizationId, ...sanitized } = status;
  return sanitized;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}

function writeHtml(response: ServerResponse, html: string, nonce: string): void {
  response.writeHead(200, {
    "cache-control": "no-store",
    "content-security-policy": createViewerLocalControlSurfaceContentSecurityPolicy(nonce),
    "content-type": "text/html; charset=utf-8",
    "x-content-type-options": "nosniff"
  });
  response.end(html);
}

function createViewerLocalControlSurfaceContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'none'",
    "base-uri 'none'",
    "connect-src 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "img-src 'self'",
    `script-src 'nonce-${nonce}'`,
    `style-src 'nonce-${nonce}'`
  ].join("; ");
}

function writeJson(response: ServerResponse, statusCode: number, body: LocalSurfaceJson): void {
  const serialized = JSON.stringify(body);
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(serialized, "utf8"),
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff"
  });
  response.end(serialized);
}

function renderViewerLocalControlSurfaceHtml(token: string, nonce: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WinBridge Viewer</title>
  <style nonce="${nonce}">
    :root { color-scheme: light dark; font-family: Segoe UI, Arial, sans-serif; }
    body { margin: 0; background: #101418; color: #eef2f6; }
    main { display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }
    header, footer { display: flex; gap: 12px; align-items: center; padding: 10px 12px; background: #1f2933; }
    header { justify-content: space-between; }
    #stage { display: grid; place-items: center; min-height: 0; background: #0b0f14; }
    #frame { display: block; max-width: 100%; max-height: calc(100vh - 112px); object-fit: contain; image-rendering: auto; }
    button, input { font: inherit; }
    button { padding: 6px 10px; border: 1px solid #52606d; background: #323f4b; color: #eef2f6; border-radius: 4px; }
    input { min-width: min(520px, 55vw); padding: 6px 8px; border: 1px solid #52606d; border-radius: 4px; }
    .keys { display: flex; flex-wrap: wrap; gap: 6px; }
    .keys button { min-width: 44px; }
    .muted { color: #bcccdc; }
    #pointerArm[aria-pressed="true"] { background: #0f766e; border-color: #2dd4bf; }
  </style>
</head>
<body>
  <main>
    <header>
      <strong>WinBridge Viewer</strong>
      <span>
        <span id="status" class="muted">status=pending</span>
        <span id="frameStatus" class="muted">frame=pending</span>
      </span>
    </header>
    <section id="stage">
      <img id="frame" alt="Remote screen frame">
    </section>
    <footer>
      <span class="keys" aria-label="Keyboard controls">
        <button type="button" data-key-command="Enter">Enter</button>
        <button type="button" data-key-command="Escape">Esc</button>
        <button type="button" data-key-command="Tab">Tab</button>
        <button type="button" data-key-command="Backspace">Backspace</button>
        <button type="button" data-key-command="ArrowUp">Up</button>
        <button type="button" data-key-command="ArrowDown">Down</button>
        <button type="button" data-key-command="ArrowLeft">Left</button>
        <button type="button" data-key-command="ArrowRight">Right</button>
      </span>
      <button id="pointerArm" type="button" aria-pressed="false">Pointer Off</button>
      <input id="command" autocomplete="off" spellcheck="false" placeholder="pointer-move 0.5 0.5">
      <button id="send" type="button">Send</button>
      <button id="disconnect" type="button">Disconnect</button>
    </footer>
  </main>
  <script nonce="${nonce}">
    const frame = document.getElementById("frame");
    const status = document.getElementById("status");
    const frameStatus = document.getElementById("frameStatus");
    const pointerArm = document.getElementById("pointerArm");
    const command = document.getElementById("command");
    const mutationToken = ${JSON.stringify(token)};
    let lastMoveAt = 0;
    let pointerArmed = false;
    let frameReady = false;
    let frameRequestSequence = 0;

    function updatePointerArm() {
      pointerArm.textContent = pointerArmed ? "Pointer On" : "Pointer Off";
      pointerArm.setAttribute("aria-pressed", pointerArmed ? "true" : "false");
      pointerArm.disabled = !frameReady;
    }

    async function postJson(path, body) {
      const response = await fetch(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "${VIEWER_LOCAL_CONTROL_SURFACE_TOKEN_HEADER}": mutationToken
        },
        body: JSON.stringify(body)
      });
      return response.json().catch(() => ({ ok: false, error: "failed" }));
    }

    async function refreshStatus() {
      const response = await fetch("/status", { cache: "no-store" });
      const body = await response.json();
      if (body.ok && body.state) {
        const signalAck = body.state.signalProbeAckReceived === true ? " signalProbeAckReceived=true" : "";
        status.textContent = "state=" + body.state.state + " visibleToHost=" + body.state.visibleToHost + " permissionCount=" + body.state.permissionCount + signalAck;
      } else {
        status.textContent = "status=not-ready";
      }
    }

    function refreshFrame() {
      const frameUrl = "/frame?t=" + Date.now();
      const requestSequence = ++frameRequestSequence;
      const nextFrame = new Image();
      frameStatus.textContent = frameReady ? "frame=refreshing" : "frame=loading";

      nextFrame.addEventListener("load", () => {
        if (requestSequence !== frameRequestSequence) return;
        frame.src = frameUrl;
        frameReady = true;
        updatePointerArm();
        frameStatus.textContent = "frame=ready";
      });

      nextFrame.addEventListener("error", () => {
        if (requestSequence !== frameRequestSequence) return;
        if (!frameReady) {
          pointerArmed = false;
          updatePointerArm();
          frameStatus.textContent = "frame=not-ready";
          return;
        }
        frameStatus.textContent = "frame=ready";
      });

      nextFrame.src = frameUrl;
    }

    function normalizedPointer(event) {
      const rect = frame.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return undefined;
      }
      const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      return { x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) };
    }

    function pointerButton(event) {
      if (event.button === 1) return "middle";
      if (event.button === 2) return "secondary";
      if (event.button === 3) return "back";
      if (event.button === 4) return "forward";
      return "primary";
    }

    async function sendCommand(line) {
      const body = await postJson("/input", { command: line });
      if (body.ok) {
        status.textContent = "input=accepted kind=" + body.kind;
      } else {
        status.textContent = "input=" + body.error;
      }
      return body;
    }

    async function sendKeyPress(key) {
      if (typeof key !== "string" || key.length === 0) return;
      const down = await sendCommand("key-down " + key);
      if (!down.ok) return;
      await sendCommand("key-up " + key);
    }

    frame.addEventListener("pointerdown", (event) => {
      if (!pointerArmed || !frameReady) return;
      const point = normalizedPointer(event);
      if (!point) return;
      event.preventDefault();
      frame.setPointerCapture(event.pointerId);
      void sendCommand("pointer-down " + point.x + " " + point.y + " " + pointerButton(event));
    });

    frame.addEventListener("pointerup", (event) => {
      if (!pointerArmed || !frameReady) return;
      const point = normalizedPointer(event);
      if (!point) return;
      event.preventDefault();
      void sendCommand("pointer-up " + point.x + " " + point.y + " " + pointerButton(event));
    });

    frame.addEventListener("pointermove", (event) => {
      if (!pointerArmed || !frameReady) return;
      const now = Date.now();
      if (now - lastMoveAt < 50) return;
      const point = normalizedPointer(event);
      if (!point) return;
      lastMoveAt = now;
      void sendCommand("pointer-move " + point.x + " " + point.y);
    });

    frame.addEventListener("wheel", (event) => {
      if (!pointerArmed || !frameReady) return;
      const point = normalizedPointer(event);
      if (!point) return;
      event.preventDefault();
      void sendCommand("pointer-wheel " + point.x + " " + point.y + " " + Math.trunc(event.deltaX) + " " + Math.trunc(event.deltaY));
    }, { passive: false });

    frame.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    frame.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });

    pointerArm.addEventListener("click", () => {
      if (!frameReady) return;
      pointerArmed = !pointerArmed;
      updatePointerArm();
    });

    document.getElementById("send").addEventListener("click", () => {
      void sendCommand(command.value);
      command.value = "";
    });

    for (const button of document.querySelectorAll("[data-key-command]")) {
      button.addEventListener("click", () => {
        void sendKeyPress(button.dataset.keyCommand);
      });
    }

    command.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        void sendCommand(command.value);
        command.value = "";
      }
    });

    document.getElementById("disconnect").addEventListener("click", async () => {
      const body = await postJson("/disconnect", {});
      status.textContent = body.ok ? "disconnect=accepted" : "disconnect=" + body.error;
    });

    setInterval(refreshStatus, 1000);
    setInterval(refreshFrame, 1000);
    void refreshStatus();
    refreshFrame();
    updatePointerArm();
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
