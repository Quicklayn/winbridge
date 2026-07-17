import { randomBytes, timingSafeEqual } from "node:crypto";
import type { BigIntStats } from "node:fs";
import { open, unlink } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { extname } from "node:path";
import { performance } from "node:perf_hooks";
import { isControlPromptCommandLineTooLong } from "./control-prompt-input.js";
import {
  createAgentShellErrorDiagnostic,
  type AgentShellInputEventInput,
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
  | {
      ok: true;
      state?: LocalSurfaceViewerStatus;
      action?: "input" | "release-input" | "disconnect";
      kind?: string;
    }
  | { ok: false; error: "not-found" | "method-not-allowed" | "rejected" | "failed" | "not-ready"; messageBytes?: number };

type LocalSurfaceViewerStatus = Omit<
  AgentShellViewerStatusSnapshot,
  "authorizationId" | "inputPointerReady" | "inputKeyboardReady"
> & {
  inputPointerReady: boolean;
  inputKeyboardReady: boolean;
};

type LocalSurfaceInputEvent = AgentShellInputEventInput["event"];
type LocalSurfacePointerButton = Extract<
  LocalSurfaceInputEvent,
  { kind: "pointer-down" | "pointer-up" }
>["button"];
type LocalSurfaceKey = Extract<
  LocalSurfaceInputEvent,
  { kind: "key-down" | "key-up" }
>["key"];
type LocalSurfacePointerPoint = Readonly<{ x: number; y: number }>;
type LocalSurfaceFrameGeneration = Readonly<{
  fingerprint: string;
  generation: string;
  observedAtMs: number;
}>;
type LocalSurfaceFrameState = {
  current?: LocalSurfaceFrameGeneration;
};
type LocalSurfaceHeldInputState = {
  keys: Set<LocalSurfaceKey>;
  pointerButtons: Set<LocalSurfacePointerButton>;
  lastPointerPoint?: LocalSurfacePointerPoint;
  releaseTimer?: NodeJS.Timeout;
};
type LocalSurfaceInputRequest = Readonly<{
  command: string;
  frameGeneration: string;
}>;

const VIEWER_LOCAL_CONTROL_SURFACE_HOST = "127.0.0.1";
const VIEWER_LOCAL_CONTROL_SURFACE_BODY_BYTES = 1024;
const VIEWER_LOCAL_CONTROL_SURFACE_TOKEN_BYTES = 32;
const VIEWER_LOCAL_CONTROL_SURFACE_TOKEN_HEADER = "x-winbridge-local-surface-token";
const VIEWER_LOCAL_CONTROL_SURFACE_FRAME_GENERATION_HEADER =
  "x-winbridge-frame-generation";
const VIEWER_LOCAL_CONTROL_SURFACE_FRAME_GENERATION_PATTERN = /^[A-Za-z0-9_-]{22}$/;
const VIEWER_LOCAL_CONTROL_SURFACE_FRAME_STALE_AFTER_MS = 5_000;
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
  const frameState: LocalSurfaceFrameState = {};
  const heldInputState: LocalSurfaceHeldInputState = {
    keys: new Set(),
    pointerButtons: new Set()
  };
  const server = createServer({ requireHostHeader: false }, (request, response) => {
    void handleViewerLocalControlSurfaceRequest(
      runtime,
      options.framePath,
      frameState,
      heldInputState,
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
    stop: async () => {
      clearHeldInputReleaseTimer(heldInputState);
      releaseTrackedLocalSurfaceInput(runtime, heldInputState, () => nextInputSequence++);
      await closeServer(server);
    }
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
    throw new Error(
      allowEphemeralPort
        ? "Viewer local control surface port must be 0 or an integer from 1024 through 65535"
        : "Viewer local control surface port must be an integer from 1024 through 65535"
    );
  }
}

async function handleViewerLocalControlSurfaceRequest(
  runtime: ViewerControlRuntime,
  framePath: string,
  frameState: LocalSurfaceFrameState,
  heldInputState: LocalSurfaceHeldInputState,
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
    if (!isViewerLocalRequestHostAllowed(request, getLocalOrigin())) {
      writeJson(response, 403, { ok: false, error: "rejected" });
      return;
    }

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
      await writeFrame(response, framePath, frameState);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/input") {
      if (!isViewerLocalMutationRequestAllowed(request, token, getLocalOrigin())) {
        writeJson(response, 403, { ok: false, error: "rejected" });
        return;
      }
      await handleInputRequest(
        runtime,
        frameState,
        heldInputState,
        allocateInputSequence,
        request,
        response
      );
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/release-input") {
      if (!isViewerLocalMutationRequestAllowed(request, token, getLocalOrigin())) {
        writeJson(response, 403, { ok: false, error: "rejected" });
        return;
      }
      await handleReleaseInputRequest(
        runtime,
        heldInputState,
        allocateInputSequence,
        request,
        response
      );
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/disconnect") {
      if (!isViewerLocalMutationRequestAllowed(request, token, getLocalOrigin())) {
        writeJson(response, 403, { ok: false, error: "rejected" });
        return;
      }
      await handleDisconnectRequest(runtime, heldInputState, allocateInputSequence, response);
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

function isViewerLocalRequestHostAllowed(
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

async function handleInputRequest(
  runtime: ViewerControlRuntime,
  frameState: LocalSurfaceFrameState,
  heldInputState: LocalSurfaceHeldInputState,
  allocateInputSequence: () => number,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const body = await readBoundedRequestBody(request);
  if (body === undefined) {
    writeJson(response, 413, { ok: false, error: "rejected" });
    return;
  }

  const inputRequest = parseInputCommandBody(body);
  if (
    inputRequest === undefined ||
    isControlPromptCommandLineTooLong(inputRequest.command)
  ) {
    writeJson(response, 400, { ok: false, error: "rejected" });
    return;
  }

  const command = parseViewerControlCommand(inputRequest.command);
  if (!command || command.action !== "input") {
    writeJson(response, 400, { ok: false, error: "rejected" });
    return;
  }

  const fresh = isCurrentFrameGenerationFresh(
    frameState.current,
    inputRequest.frameGeneration,
    performance.now()
  );
  const event = fresh
    ? command.event
    : createMatchingReleaseOnlyEvent(command.event, heldInputState);
  if (!event) {
    writeJson(response, 409, { ok: false, error: "not-ready" });
    return;
  }

  try {
    const accepted = sendViewerControlInputEvent(
      runtime,
      event,
      allocateInputSequence
    );
    recordAcceptedLocalSurfaceInput(event, heldInputState);
    updateHeldInputReleaseTimer(
      runtime,
      frameState.current,
      heldInputState,
      allocateInputSequence
    );
    writeJson(response, 202, { ok: true, action: accepted.action, kind: accepted.kind });
  } catch (error) {
    const diagnostic = createAgentShellErrorDiagnostic(error);
    writeJson(response, 409, { ok: false, error: "not-ready", messageBytes: diagnostic.messageBytes });
  }
}

async function handleReleaseInputRequest(
  runtime: ViewerControlRuntime,
  heldInputState: LocalSurfaceHeldInputState,
  allocateInputSequence: () => number,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const body = await readBoundedRequestBody(request);
  if (body === undefined || !isExactEmptyJsonObject(body)) {
    writeJson(response, body === undefined ? 413 : 400, { ok: false, error: "rejected" });
    return;
  }

  const released = releaseTrackedLocalSurfaceInput(
    runtime,
    heldInputState,
    allocateInputSequence
  );
  writeJson(
    response,
    released ? 202 : 409,
    released
      ? { ok: true, action: "release-input" }
      : { ok: false, error: "not-ready" }
  );
}

async function handleDisconnectRequest(
  runtime: ViewerControlRuntime,
  heldInputState: LocalSurfaceHeldInputState,
  allocateInputSequence: () => number,
  response: ServerResponse
): Promise<void> {
  releaseTrackedLocalSurfaceInput(runtime, heldInputState, allocateInputSequence);
  try {
    await runtime.leave();
    clearHeldInputReleaseTimer(heldInputState);
    heldInputState.keys.clear();
    heldInputState.pointerButtons.clear();
    heldInputState.lastPointerPoint = undefined;
    writeJson(response, 202, { ok: true, action: "disconnect" });
  } catch (error) {
    const diagnostic = createAgentShellErrorDiagnostic(error);
    writeJson(response, 500, { ok: false, error: "failed", messageBytes: diagnostic.messageBytes });
  }
}

async function writeFrame(
  response: ServerResponse,
  framePath: string,
  frameState: LocalSurfaceFrameState
): Promise<void> {
  try {
    const snapshot = await readStableFrame(framePath);
    if (!snapshot) {
      writeJson(response, 404, { ok: false, error: "not-ready" });
      return;
    }

    const generation = observeFrameFingerprint(
      frameState,
      snapshot.fingerprint,
      performance.now()
    );
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-length": snapshot.frame.byteLength,
      "content-type": contentTypeForFrame(snapshot.frame, framePath),
      [VIEWER_LOCAL_CONTROL_SURFACE_FRAME_GENERATION_HEADER]: generation.generation,
      "x-content-type-options": "nosniff"
    });
    response.end(snapshot.frame);
  } catch {
    writeJson(response, 404, { ok: false, error: "not-ready" });
  }
}

async function readStableFrame(
  framePath: string
): Promise<Readonly<{ frame: Buffer; fingerprint: string }> | undefined> {
  const frameHandle = await open(framePath, "r");
  try {
    const before = await frameHandle.stat({ bigint: true });
    const frame = await frameHandle.readFile();
    const after = await frameHandle.stat({ bigint: true });
    const fingerprint = createFrameFingerprint(before);
    if (fingerprint !== createFrameFingerprint(after)) {
      return undefined;
    }

    return { frame, fingerprint };
  } finally {
    await frameHandle.close();
  }
}

function createFrameFingerprint(stats: BigIntStats): string {
  return [
    stats.dev,
    stats.ino,
    stats.size,
    stats.mtimeNs,
    stats.ctimeNs,
    stats.birthtimeNs
  ].join(":");
}

function observeFrameFingerprint(
  frameState: LocalSurfaceFrameState,
  fingerprint: string,
  nowMs: number
): LocalSurfaceFrameGeneration {
  if (frameState.current?.fingerprint === fingerprint) {
    return frameState.current;
  }

  const current = {
    fingerprint,
    generation: randomBytes(16).toString("base64url"),
    observedAtMs: nowMs
  };
  frameState.current = current;
  return current;
}

function isCurrentFrameGenerationFresh(
  current: LocalSurfaceFrameGeneration | undefined,
  generation: string,
  nowMs: number
): boolean {
  if (!current || current.generation !== generation) {
    return false;
  }

  const ageMs = nowMs - current.observedAtMs;
  return ageMs >= 0 && ageMs < VIEWER_LOCAL_CONTROL_SURFACE_FRAME_STALE_AFTER_MS;
}

function createMatchingReleaseOnlyEvent(
  event: LocalSurfaceInputEvent,
  heldInputState: LocalSurfaceHeldInputState
): LocalSurfaceInputEvent | undefined {
  if (event.kind === "key-up" && heldInputState.keys.has(event.key)) {
    return { ...event, modifiers: [] };
  }

  if (
    event.kind === "pointer-up" &&
    heldInputState.pointerButtons.has(event.button) &&
    heldInputState.lastPointerPoint
  ) {
    return {
      ...event,
      x: heldInputState.lastPointerPoint.x,
      y: heldInputState.lastPointerPoint.y
    };
  }

  return undefined;
}

function recordAcceptedLocalSurfaceInput(
  event: LocalSurfaceInputEvent,
  heldInputState: LocalSurfaceHeldInputState
): void {
  switch (event.kind) {
    case "pointer-move":
    case "pointer-wheel":
      heldInputState.lastPointerPoint = { x: event.x, y: event.y };
      return;
    case "pointer-down":
      heldInputState.pointerButtons.add(event.button);
      heldInputState.lastPointerPoint = { x: event.x, y: event.y };
      return;
    case "pointer-up":
      heldInputState.pointerButtons.delete(event.button);
      heldInputState.lastPointerPoint = { x: event.x, y: event.y };
      return;
    case "key-down":
      heldInputState.keys.add(event.key);
      return;
    case "key-up":
      heldInputState.keys.delete(event.key);
  }
}

function updateHeldInputReleaseTimer(
  runtime: ViewerControlRuntime,
  currentFrame: LocalSurfaceFrameGeneration | undefined,
  heldInputState: LocalSurfaceHeldInputState,
  allocateInputSequence: () => number
): void {
  if (!hasTrackedHeldInput(heldInputState)) {
    clearHeldInputReleaseTimer(heldInputState);
    return;
  }

  clearHeldInputReleaseTimer(heldInputState);
  const staleAtMs =
    (currentFrame?.observedAtMs ?? performance.now()) +
    VIEWER_LOCAL_CONTROL_SURFACE_FRAME_STALE_AFTER_MS;
  const delayMs = Math.max(1, staleAtMs - performance.now());
  const releaseTimer = setTimeout(() => {
    heldInputState.releaseTimer = undefined;
    releaseTrackedLocalSurfaceInput(runtime, heldInputState, allocateInputSequence);
  }, delayMs);
  releaseTimer.unref();
  heldInputState.releaseTimer = releaseTimer;
}

function releaseTrackedLocalSurfaceInput(
  runtime: ViewerControlRuntime,
  heldInputState: LocalSurfaceHeldInputState,
  allocateInputSequence: () => number
): boolean {
  let released = true;
  for (const key of [...heldInputState.keys].sort()) {
    try {
      sendViewerControlInputEvent(
        runtime,
        { kind: "key-up", key, modifiers: [] },
        allocateInputSequence
      );
      heldInputState.keys.delete(key);
    } catch {
      released = false;
    }
  }

  const pointerPoint = heldInputState.lastPointerPoint;
  for (const button of [...heldInputState.pointerButtons].sort()) {
    if (!pointerPoint) {
      released = false;
      continue;
    }
    try {
      sendViewerControlInputEvent(
        runtime,
        {
          kind: "pointer-up",
          x: pointerPoint.x,
          y: pointerPoint.y,
          button
        },
        allocateInputSequence
      );
      heldInputState.pointerButtons.delete(button);
    } catch {
      released = false;
    }
  }

  if (!hasTrackedHeldInput(heldInputState)) {
    clearHeldInputReleaseTimer(heldInputState);
    heldInputState.lastPointerPoint = undefined;
  }
  return released && !hasTrackedHeldInput(heldInputState);
}

function hasTrackedHeldInput(heldInputState: LocalSurfaceHeldInputState): boolean {
  return heldInputState.keys.size > 0 || heldInputState.pointerButtons.size > 0;
}

function clearHeldInputReleaseTimer(heldInputState: LocalSurfaceHeldInputState): void {
  if (heldInputState.releaseTimer) {
    clearTimeout(heldInputState.releaseTimer);
    heldInputState.releaseTimer = undefined;
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

function parseInputCommandBody(body: string): LocalSurfaceInputRequest | undefined {
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
    !hasExactInputRequestKeys(parsed)
  ) {
    return undefined;
  }

  const command = (parsed as { command?: unknown }).command;
  const frameGeneration = (parsed as { frameGeneration?: unknown }).frameGeneration;
  if (
    typeof command !== "string" ||
    typeof frameGeneration !== "string" ||
    !VIEWER_LOCAL_CONTROL_SURFACE_FRAME_GENERATION_PATTERN.test(frameGeneration)
  ) {
    return undefined;
  }

  return { command, frameGeneration };
}

function hasExactInputRequestKeys(value: object): boolean {
  const keys = Object.keys(value).sort();
  return keys.length === 2 && keys[0] === "command" && keys[1] === "frameGeneration";
}

function isExactEmptyJsonObject(body: string): boolean {
  try {
    const parsed: unknown = JSON.parse(body);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      Object.keys(parsed).length === 0
    );
  } catch {
    return false;
  }
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
  return {
    ...sanitized,
    inputPointerReady: status.inputPointerReady === true,
    inputKeyboardReady: status.inputKeyboardReady === true
  };
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
    "img-src 'self' blob:",
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
    button:disabled { opacity: 0.55; }
    input { min-width: min(520px, 55vw); padding: 6px 8px; border: 1px solid #52606d; border-radius: 4px; }
    .keys { display: flex; flex-wrap: wrap; gap: 6px; max-width: min(760px, 62vw); }
    .keys button { min-width: 38px; }
    .modifier[aria-pressed="true"] { background: #6d28d9; border-color: #a78bfa; }
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
        <button class="modifier" type="button" data-key-modifier="shift" aria-pressed="false">Shift</button>
        <button class="modifier" type="button" data-key-modifier="control" aria-pressed="false">Ctrl</button>
        <button class="modifier" type="button" data-key-modifier="alt" aria-pressed="false">Alt</button>
        <button class="modifier" type="button" data-key-modifier="meta" aria-pressed="false">Meta</button>
        <button type="button" data-key-command="KeyA">A</button>
        <button type="button" data-key-command="KeyB">B</button>
        <button type="button" data-key-command="KeyC">C</button>
        <button type="button" data-key-command="KeyD">D</button>
        <button type="button" data-key-command="KeyE">E</button>
        <button type="button" data-key-command="KeyF">F</button>
        <button type="button" data-key-command="KeyG">G</button>
        <button type="button" data-key-command="KeyH">H</button>
        <button type="button" data-key-command="KeyI">I</button>
        <button type="button" data-key-command="KeyJ">J</button>
        <button type="button" data-key-command="KeyK">K</button>
        <button type="button" data-key-command="KeyL">L</button>
        <button type="button" data-key-command="KeyM">M</button>
        <button type="button" data-key-command="KeyN">N</button>
        <button type="button" data-key-command="KeyO">O</button>
        <button type="button" data-key-command="KeyP">P</button>
        <button type="button" data-key-command="KeyQ">Q</button>
        <button type="button" data-key-command="KeyR">R</button>
        <button type="button" data-key-command="KeyS">S</button>
        <button type="button" data-key-command="KeyT">T</button>
        <button type="button" data-key-command="KeyU">U</button>
        <button type="button" data-key-command="KeyV">V</button>
        <button type="button" data-key-command="KeyW">W</button>
        <button type="button" data-key-command="KeyX">X</button>
        <button type="button" data-key-command="KeyY">Y</button>
        <button type="button" data-key-command="KeyZ">Z</button>
        <button type="button" data-key-command="Digit0">0</button>
        <button type="button" data-key-command="Digit1">1</button>
        <button type="button" data-key-command="Digit2">2</button>
        <button type="button" data-key-command="Digit3">3</button>
        <button type="button" data-key-command="Digit4">4</button>
        <button type="button" data-key-command="Digit5">5</button>
        <button type="button" data-key-command="Digit6">6</button>
        <button type="button" data-key-command="Digit7">7</button>
        <button type="button" data-key-command="Digit8">8</button>
        <button type="button" data-key-command="Digit9">9</button>
        <button type="button" data-key-command="Space">Space</button>
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
    const sendButton = document.getElementById("send");
    const mutationToken = ${JSON.stringify(token)};
    let lastMoveAt = 0;
    let pointerArmed = false;
    let frameReady = false;
    let frameFresh = false;
    let statusPointerReady = false;
    let statusKeyboardReady = false;
    let frameRequestSequence = 0;
    let displayedFrameLoadedAt = undefined;
    let displayedFrameGeneration = undefined;
    let displayedFrameObjectUrl = undefined;
    let inputOperationQueue = Promise.resolve();
    let releaseRequestPromise = undefined;
    const frameStaleAfterMs = ${VIEWER_LOCAL_CONTROL_SURFACE_FRAME_STALE_AFTER_MS};
    const frameGenerationPattern = /^[A-Za-z0-9_-]{22}$/;
    const activeModifiers = new Set();
    const heldKeys = new Set();
    const heldPointerButtons = new Set();
    const modifierButtons = Array.from(document.querySelectorAll("[data-key-modifier]"));
    const keyCommandButtons = Array.from(document.querySelectorAll("[data-key-command]"));

    function isLocalPointerReady() {
      return frameReady && frameFresh && statusPointerReady;
    }

    function isLocalKeyboardReady() {
      return frameReady && frameFresh && statusKeyboardReady;
    }

    function isAnyLocalInputReady() {
      return isLocalPointerReady() || isLocalKeyboardReady();
    }

    function updatePointerArm() {
      if (!isLocalPointerReady()) {
        pointerArmed = false;
      }
      pointerArm.textContent = pointerArmed ? "Pointer On" : "Pointer Off";
      pointerArm.setAttribute("aria-pressed", pointerArmed ? "true" : "false");
      pointerArm.disabled = !isLocalPointerReady();
    }

    function updateModifierButtons() {
      const disabled = !isLocalKeyboardReady();
      for (const button of modifierButtons) {
        const modifier = button.dataset.keyModifier;
        const pressed = typeof modifier === "string" && activeModifiers.has(modifier);
        button.setAttribute("aria-pressed", pressed ? "true" : "false");
        button.disabled = disabled;
      }
    }

    function updateInputControls() {
      updatePointerArm();
      updateModifierButtons();
      sendButton.disabled = !isAnyLocalInputReady();
      for (const button of keyCommandButtons) {
        button.disabled = !isLocalKeyboardReady();
      }
    }

    function clearModifiers() {
      activeModifiers.clear();
      updateModifierButtons();
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
      return response.json();
    }

    async function refreshStatus() {
      const response = await fetch("/status", { cache: "no-store" });
      const body = await response.json();
      if (body.ok && body.state) {
        statusPointerReady = body.state.state === "active" && body.state.visibleToHost === true && body.state.inputPointerReady === true;
        statusKeyboardReady = body.state.state === "active" && body.state.visibleToHost === true && body.state.inputKeyboardReady === true;
        const signalAck = body.state.signalProbeAckReceived === true ? " signalProbeAckReceived=true" : "";
        status.textContent = "state=" + body.state.state + " visibleToHost=" + body.state.visibleToHost + " permissionCount=" + body.state.permissionCount + " pointerReady=" + statusPointerReady + " keyboardReady=" + statusKeyboardReady + signalAck;
      } else {
        statusPointerReady = false;
        statusKeyboardReady = false;
        status.textContent = "status=not-ready";
      }
      updateInputControls();
      if (
        (heldKeys.size > 0 && !statusKeyboardReady) ||
        (heldPointerButtons.size > 0 && !statusPointerReady)
      ) {
        void releaseHeldInputs();
      }
    }

    function frameAgeBucket(ageMs) {
      if (!Number.isFinite(ageMs) || ageMs < 0) return "unknown";
      if (ageMs < 1000) return "0";
      if (ageMs < 5000) return "1000";
      if (ageMs < 15000) return "5000";
      if (ageMs < 30000) return "15000";
      return "30000";
    }

    function updateFrameFreshness() {
      if (!frameReady || displayedFrameLoadedAt === undefined) {
        return;
      }
      const ageMs = performance.now() - displayedFrameLoadedAt;
      const stale = ageMs >= frameStaleAfterMs;
      const wasFresh = frameFresh;
      frameFresh = !stale;
      frameStatus.textContent = "frame=" + (stale ? "stale" : "ready") + " frameAgeMs=" + frameAgeBucket(ageMs);
      if (wasFresh && stale) {
        pointerArmed = false;
        activeModifiers.clear();
        updateInputControls();
        void releaseHeldInputs();
      }
    }

    async function refreshFrame() {
      const frameUrl = "/frame?t=" + Date.now();
      const requestSequence = ++frameRequestSequence;
      frameStatus.textContent = frameReady ? "frame=refreshing" : "frame=loading";

      try {
        const response = await fetch(frameUrl, { cache: "no-store" });
        if (requestSequence !== frameRequestSequence) return;
        if (!response.ok) throw new Error("frame-not-ready");
        const generation = response.headers.get("${VIEWER_LOCAL_CONTROL_SURFACE_FRAME_GENERATION_HEADER}");
        if (!generation || !frameGenerationPattern.test(generation)) {
          throw new Error("frame-generation-not-ready");
        }
        if (generation === displayedFrameGeneration) {
          await response.body?.cancel();
          updateFrameFreshness();
          return;
        }

        const frameBlob = await response.blob();
        if (requestSequence !== frameRequestSequence) return;
        if (frameBlob.type !== "image/png" && frameBlob.type !== "image/jpeg") {
          throw new Error("frame-type-not-ready");
        }

        const nextFrameObjectUrl = URL.createObjectURL(frameBlob);
        const nextFrame = new Image();
        nextFrame.addEventListener("load", () => {
          if (requestSequence !== frameRequestSequence) {
            URL.revokeObjectURL(nextFrameObjectUrl);
            return;
          }
          const previousFrameObjectUrl = displayedFrameObjectUrl;
          frame.src = nextFrameObjectUrl;
          displayedFrameObjectUrl = nextFrameObjectUrl;
          displayedFrameGeneration = generation;
          displayedFrameLoadedAt = performance.now();
          frameReady = true;
          frameFresh = true;
          if (previousFrameObjectUrl) URL.revokeObjectURL(previousFrameObjectUrl);
          updateInputControls();
          updateFrameFreshness();
        }, { once: true });
        nextFrame.addEventListener("error", () => {
          URL.revokeObjectURL(nextFrameObjectUrl);
          if (requestSequence !== frameRequestSequence) return;
          if (!frameReady) {
            frameFresh = false;
            pointerArmed = false;
            updateInputControls();
            frameStatus.textContent = "frame=not-ready";
            return;
          }
          updateFrameFreshness();
        }, { once: true });
        nextFrame.src = nextFrameObjectUrl;
      } catch {
        if (requestSequence !== frameRequestSequence) return;
        if (!frameReady) {
          frameFresh = false;
          pointerArmed = false;
          updateInputControls();
          frameStatus.textContent = "frame=not-ready";
          return;
        }
        updateFrameFreshness();
      }
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

    function trackAcceptedInput(line) {
      const tokens = line.split(" ");
      const kind = tokens[0];
      if (kind === "key-down" && tokens[1]) {
        heldKeys.add(tokens[1]);
      } else if (kind === "key-up" && tokens[1]) {
        heldKeys.delete(tokens[1]);
      } else if (kind === "pointer-down" && tokens[3]) {
        heldPointerButtons.add(tokens[3]);
      } else if (kind === "pointer-up" && tokens[3]) {
        heldPointerButtons.delete(tokens[3]);
      }

      if (!frameFresh && (heldKeys.size > 0 || heldPointerButtons.size > 0)) {
        void releaseHeldInputs();
      }
    }

    function enqueueInputOperation(operation) {
      const result = inputOperationQueue.then(operation, operation);
      inputOperationQueue = result.then(() => undefined, () => undefined);
      return result;
    }

    async function sendCommandNow(line, generation = displayedFrameGeneration) {
      try {
        const body = await postJson("/input", { command: line, frameGeneration: generation });
        if (body.ok) {
          trackAcceptedInput(line);
          status.textContent = "input=accepted kind=" + body.kind;
        } else {
          status.textContent = "input=" + body.error;
        }
        return body;
      } catch {
        status.textContent = "input=failed";
        void releaseHeldInputs();
        return { ok: false, error: "failed" };
      }
    }

    function sendCommand(line, generation = displayedFrameGeneration) {
      return enqueueInputOperation(() => sendCommandNow(line, generation));
    }

    function releaseHeldInputs() {
      if (releaseRequestPromise) return releaseRequestPromise;
      const request = enqueueInputOperation(async () => {
        try {
          const body = await postJson("/release-input", {});
          if (body.ok) {
            heldKeys.clear();
            heldPointerButtons.clear();
          }
          return body;
        } catch {
          return { ok: false, error: "failed" };
        }
      });
      releaseRequestPromise = request.finally(() => {
        releaseRequestPromise = undefined;
      });
      return releaseRequestPromise;
    }

    function sendKeyPress(key) {
      if (typeof key !== "string" || key.length === 0) {
        return Promise.resolve({ ok: false, error: "rejected" });
      }
      const modifiers = Array.from(activeModifiers).join(",");
      const suffix = modifiers ? " " + modifiers : "";
      const generation = displayedFrameGeneration;
      return enqueueInputOperation(async () => {
        try {
          const down = await sendCommandNow("key-down " + key + suffix, generation);
          if (!down.ok) return down;
          return await sendCommandNow("key-up " + key + suffix, generation);
        } finally {
          clearModifiers();
        }
      });
    }

    frame.addEventListener("pointerdown", (event) => {
      if (!pointerArmed || !isLocalPointerReady()) return;
      const point = normalizedPointer(event);
      if (!point) return;
      event.preventDefault();
      frame.setPointerCapture(event.pointerId);
      void sendCommand("pointer-down " + point.x + " " + point.y + " " + pointerButton(event));
    });

    frame.addEventListener("pointerup", (event) => {
      const button = pointerButton(event);
      if ((!pointerArmed || !isLocalPointerReady()) && !heldPointerButtons.has(button)) return;
      const point = normalizedPointer(event);
      if (!point) return;
      event.preventDefault();
      void sendCommand("pointer-up " + point.x + " " + point.y + " " + button);
    });

    frame.addEventListener("pointermove", (event) => {
      if (!pointerArmed || !isLocalPointerReady()) return;
      const now = Date.now();
      if (now - lastMoveAt < 50) return;
      const point = normalizedPointer(event);
      if (!point) return;
      lastMoveAt = now;
      void sendCommand("pointer-move " + point.x + " " + point.y);
    });

    frame.addEventListener("wheel", (event) => {
      if (!pointerArmed || !isLocalPointerReady()) return;
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
      if (!isLocalPointerReady()) return;
      pointerArmed = !pointerArmed;
      updatePointerArm();
    });

    for (const button of modifierButtons) {
      button.addEventListener("click", () => {
        if (!isLocalKeyboardReady()) return;
        const modifier = button.dataset.keyModifier;
        if (typeof modifier !== "string") return;
        if (activeModifiers.has(modifier)) {
          activeModifiers.delete(modifier);
        } else {
          activeModifiers.add(modifier);
        }
        updateModifierButtons();
      });
    }

    document.getElementById("send").addEventListener("click", () => {
      if (!isAnyLocalInputReady()) return;
      void sendCommand(command.value);
      command.value = "";
    });

    for (const button of keyCommandButtons) {
      button.addEventListener("click", () => {
        if (!isLocalKeyboardReady()) return;
        void sendKeyPress(button.dataset.keyCommand);
      });
    }

    command.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        if (!isAnyLocalInputReady()) return;
        void sendCommand(command.value);
        command.value = "";
      }
    });

    document.getElementById("disconnect").addEventListener("click", async () => {
      await releaseHeldInputs();
      const body = await enqueueInputOperation(() => postJson("/disconnect", {})).catch(
        () => ({ ok: false, error: "failed" })
      );
      status.textContent = body.ok ? "disconnect=accepted" : "disconnect=" + body.error;
    });

    window.addEventListener("pagehide", () => {
      void releaseHeldInputs();
    });

    setInterval(refreshStatus, 1000);
    setInterval(() => void refreshFrame(), 1000);
    setInterval(updateFrameFreshness, 1000);
    void refreshStatus();
    void refreshFrame();
    updatePointerArm();
    updateModifierButtons();
    updateInputControls();
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
