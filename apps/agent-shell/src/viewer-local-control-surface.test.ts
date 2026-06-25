import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ViewerLocalControlSurfaceRuntime } from "./viewer-local-control-surface.js";
import {
  startViewerLocalControlSurface,
  type ViewerLocalControlSurfaceHandle
} from "./viewer-local-control-surface.js";

const FRAME_BYTES = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=", "base64");
const JPEG_FRAME_BYTES = Buffer.from("/9j/4AAQSkZJRg==", "base64");

const handles: ViewerLocalControlSurfaceHandle[] = [];
const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(handles.splice(0).map((handle) => handle.stop()));
  for (const tempDir of tempDirs.splice(0)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("viewer local control surface", () => {
  it("starts on loopback and returns sanitized viewer status", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue({
      state: "active",
      visibleToHost: true,
      permissionCount: 3,
      authorizationStatus: "active",
      authorizationId: "authz_surface_private",
      expiresAt: "2026-06-17T12:00:00.000Z"
    });
    const handle = await startSurface(runtime);

    expect(handle.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/$/);

    const response = await fetch(`${handle.url}status`);
    const body = await response.json() as {
      ok: true;
      state: Record<string, unknown>;
    };

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      state: {
        state: "active",
        visibleToHost: true,
        permissionCount: 3,
        authorizationStatus: "active",
        expiresAt: "2026-06-17T12:00:00.000Z"
      }
    });
    expect(JSON.stringify(body)).not.toContain("authz_surface_private");
    expect(JSON.stringify(body)).not.toContain("raw-token");
  });

  it("returns bounded signal acknowledgement metadata without authorization ids", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue({
      state: "active",
      visibleToHost: true,
      permissionCount: 1,
      authorizationStatus: "active",
      authorizationId: "authz_surface_signal_private",
      signalProbeAckReceived: true
    });
    const handle = await startSurface(runtime);

    const response = await fetch(`${handle.url}status`);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("\"signalProbeAckReceived\":true");
    expect(body).not.toContain("authz_surface_signal_private");
    expect(body).not.toContain("host-signal-probe-ack-v1");
    expect(body).not.toContain("viewer-signal-probe-v1");
    expect(body).not.toContain("Viewer Support");
    expect(body).not.toContain("raw-token");
  });

  it("renders signal acknowledgement status without raw signal payload markers", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("body.state.signalProbeAckReceived === true");
    expect(html).toContain('signalProbeAckReceived=true');
    expect(html).toContain("+ signalAck");
    expect(html).not.toContain("host-signal-probe-ack-v1");
    expect(html).not.toContain("viewer-signal-probe-v1");
    expect(html).not.toContain("authorizationId");
    expect(html).not.toContain("raw-token");
  });

  it("renders explicit keyboard buttons without document-level keyboard capture", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('data-key-modifier="shift"');
    expect(html).toContain('data-key-modifier="control"');
    expect(html).toContain('data-key-modifier="alt"');
    expect(html).toContain('data-key-modifier="meta"');
    expect(html).toContain('data-key-command="Enter"');
    expect(html).toContain('data-key-command="Escape"');
    expect(html).toContain('data-key-command="Tab"');
    expect(html).toContain('data-key-command="Backspace"');
    expect(html).toContain('data-key-command="ArrowUp"');
    expect(html).toContain('data-key-command="ArrowDown"');
    expect(html).toContain('data-key-command="ArrowLeft"');
    expect(html).toContain('data-key-command="ArrowRight"');
    expect(html).not.toContain("document.addEventListener(\"keydown\"");
    expect(html).not.toContain("window.addEventListener(\"keydown\"");
    expect(html).not.toContain("document.onkeydown");
    expect(html).not.toContain("window.onkeydown");
    expect(html).not.toContain("document.addEventListener(\"keypress\"");
    expect(html).not.toContain("window.addEventListener(\"keypress\"");
    expect(html).not.toContain("textarea");
  });

  it("renders one-shot modifier toggles gated on input readiness", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("const activeModifiers = new Set();");
    expect(html).toContain('const modifierButtons = Array.from(document.querySelectorAll("[data-key-modifier]"));');
    expect(html).toContain("function updateModifierButtons()");
    expect(html).toContain("const disabled = !isLocalInputReady();");
    expect(html).toContain("button.disabled = disabled;");
    expect(html).toContain("function clearModifiers()");
    expect(html).toContain("activeModifiers.clear();");
    expect(html).toContain("const modifiers = Array.from(activeModifiers).join(\",\");");
    expect(html).toContain('const suffix = modifiers ? " " + modifiers : "";');
    expect(html).toContain("await sendCommand(\"key-down \" + key + suffix);");
    expect(html).toContain("await sendCommand(\"key-up \" + key + suffix);");
    expect(html).toContain("finally {\n        clearModifiers();\n      }");
    expect(html).toContain('button.addEventListener("click", () => {');
    expect(html).toContain("if (!isLocalInputReady()) return;");
    expect(html).toContain("updateModifierButtons();");
    expect(html).not.toContain("activeModifiers.add(" + '"shift"' + ");");
    expect(html).not.toContain("sendCommand(\"key-down shift");
    expect(html).not.toContain("sendCommand(\"key-up shift");
  });

  it("renders pointer arming controls and gates browser pointer handlers", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('id="pointerArm"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("Pointer Off");
    expect(html).toContain("Pointer On");
    expect(html).toContain("let pointerArmed = false;");
    expect(html).toContain("let frameReady = false;");
    expect(html).toContain("let statusInputReady = false;");
    expect(html).toContain("let frameRequestSequence = 0;");
    expect(html).toContain("function isLocalInputReady()");
    expect(html).toContain("return frameReady && statusInputReady;");
    expect(html).toContain("function updatePointerArm()");
    expect(html).toContain('pointerArm.setAttribute("aria-pressed", pointerArmed ? "true" : "false")');
    expect(html).toContain("pointerArm.disabled = !isLocalInputReady();");
    expect(html).toContain('pointerArm.addEventListener("click"');
    expect(html).toContain("if (!isLocalInputReady()) return;");
    expect(html).toContain("pointerArmed = !pointerArmed;");
    expect(html.match(/if \(!pointerArmed \|\| !isLocalInputReady\(\)\) return;/g)).toHaveLength(4);
    expect(html.match(/pointerArmed = false;/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("frameReady = true;");
    expect(html).toContain('frameStatus.textContent = frameReady ? "frame=refreshing" : "frame=loading"');
    expect(html).toContain('frameStatus.textContent = "frame=not-ready"');
    expect(html).not.toContain("document.addEventListener(\"pointer");
    expect(html).not.toContain("window.addEventListener(\"pointer");
  });

  it("renders local input controls gated on sanitized status and displayed frame readiness", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("let statusInputReady = false;");
    expect(html).toContain("function isLocalInputReady()");
    expect(html).toContain("return frameReady && statusInputReady;");
    expect(html).toContain(
      'statusInputReady = body.state.state === "active" && body.state.visibleToHost === true && Number.isInteger(body.state.permissionCount) && body.state.permissionCount > 0;',
    );
    expect(html).toContain(
      'status.textContent = "state=" + body.state.state + " visibleToHost=" + body.state.visibleToHost + " permissionCount=" + body.state.permissionCount + " inputReady=" + statusInputReady + signalAck;',
    );
    expect(html).toContain('const keyCommandButtons = Array.from(document.querySelectorAll("[data-key-command]"));');
    expect(html).toContain("function updateInputControls()");
    expect(html).toContain("sendButton.disabled = disabled;");
    expect(html).toContain("for (const button of keyCommandButtons)");
    expect(html).toContain("button.disabled = disabled;");
    expect(html).toContain("updateInputControls();");
    expect(html).toContain('if (event.key === "Enter")');
    expect(html).toContain("if (!isLocalInputReady()) return;");
    expect(html).not.toContain("authorizationId");
    expect(html).not.toContain("raw-token");
    expect(html).not.toContain("pairingCode");
  });

  it("preloads replacement frames without disarming the displayed ready frame", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("const frameUrl = \"/frame?t=\" + Date.now();");
    expect(html).toContain("const requestSequence = ++frameRequestSequence;");
    expect(html).toContain("const nextFrame = new Image();");
    expect(html).toContain('nextFrame.addEventListener("load"');
    expect(html).toContain('nextFrame.addEventListener("error"');
    expect(html.match(/if \(requestSequence !== frameRequestSequence\) return;/g)).toHaveLength(2);
    expect(html).toContain("frame.src = frameUrl;");
    expect(html).toContain("nextFrame.src = frameUrl;");
    expect(html).toContain("updateFrameFreshness();");
    expect(html).not.toContain('frame.addEventListener("load"');
    expect(html).not.toContain('frame.addEventListener("error"');
  });

  it("suppresses browser defaults only on the displayed frame", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('frame.addEventListener("contextmenu"');
    expect(html).toContain('frame.addEventListener("dragstart"');
    expect(html.match(/event\.preventDefault\(\);/g)?.length).toBeGreaterThanOrEqual(4);
    expect(html).not.toContain("document.addEventListener(\"contextmenu\"");
    expect(html).not.toContain("window.addEventListener(\"contextmenu\"");
    expect(html).not.toContain("document.addEventListener(\"dragstart\"");
    expect(html).not.toContain("window.addEventListener(\"dragstart\"");
  });

  it("serves HTML with nonce-based CSP without exposing the mutation token in headers", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();
    const contentSecurityPolicy = response.headers.get("content-security-policy") ?? "";
    const headers = Array.from(response.headers.entries())
      .map(([name, value]) => `${name}: ${value}`)
      .join("\n");
    const scriptNonce = contentSecurityPolicy.match(/script-src 'nonce-([^']+)'/)?.[1];
    const styleNonce = contentSecurityPolicy.match(/style-src 'nonce-([^']+)'/)?.[1];

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(contentSecurityPolicy).toContain("default-src 'none'");
    expect(contentSecurityPolicy).toContain("connect-src 'self'");
    expect(contentSecurityPolicy).toContain("img-src 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).not.toContain("'unsafe-inline'");
    expect(scriptNonce).toBeDefined();
    expect(styleNonce).toBe(scriptNonce);
    expect(html).toContain(`<style nonce="${scriptNonce}">`);
    expect(html).toContain(`<script nonce="${scriptNonce}">`);
    expect(headers).not.toContain(handle.token);
  });

  it("renders bounded frame readiness state without exposing frame diagnostics", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('id="frameStatus"');
    expect(html).toContain("frame=pending");
    expect(html).toContain('frameStatus.textContent = frameReady ? "frame=refreshing" : "frame=loading"');
    expect(html).toContain('"frame=" + (stale ? "stale" : "ready")');
    expect(html).toContain('frameStatus.textContent = "frame=not-ready"');
    expect(html).not.toContain("latest.png");
    expect(html).not.toContain("response.text()");
    expect(html).not.toContain("raw-token");
  });

  it("renders bounded local frame freshness without exposing frame diagnostics", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("let displayedFrameLoadedAt = undefined;");
    expect(html).toContain("const frameStaleAfterMs = 5000;");
    expect(html).toContain("function frameAgeBucket(ageMs)");
    expect(html).toContain('return "unknown";');
    expect(html).toContain('return "30000";');
    expect(html).toContain("function updateFrameFreshness()");
    expect(html).toContain("const stale = ageMs >= frameStaleAfterMs;");
    expect(html).toContain('"frame=" + (stale ? "stale" : "ready") + " frameAgeMs=" + frameAgeBucket(ageMs)');
    expect(html).toContain("displayedFrameLoadedAt = Date.now();");
    expect(html).toContain("setInterval(updateFrameFreshness, 1000);");
    expect(html).not.toContain("latest.png");
    expect(html).not.toContain("authorizationId");
    expect(html).not.toContain("raw-token");
    expect(html).not.toContain("response.text()");
  });

  it("serves only the configured latest frame file", async () => {
    const runtime = createRuntimeSpy();
    const tempDir = createTempDir();
    const framePath = join(tempDir, "latest.png");
    const handle = await startSurface(runtime, framePath);
    writeFileSync(framePath, FRAME_BYTES);

    const response = await fetch(`${handle.url}frame`);
    const frame = Buffer.from(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(frame).toEqual(FRAME_BYTES);
  });

  it("serves JPEG frames by byte signature even when the configured path has a PNG extension", async () => {
    const runtime = createRuntimeSpy();
    const tempDir = createTempDir();
    const framePath = join(tempDir, "latest.png");
    const handle = await startSurface(runtime, framePath);
    writeFileSync(framePath, JPEG_FRAME_BYTES);

    const response = await fetch(`${handle.url}frame`);
    const frame = Buffer.from(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(frame).toEqual(JPEG_FRAME_BYTES);
  });

  it("does not serve a stale pre-existing frame file from a previous surface run", async () => {
    const runtime = createRuntimeSpy();
    const tempDir = createTempDir();
    const framePath = join(tempDir, "latest.png");
    writeFileSync(framePath, FRAME_BYTES);
    const handle = await startSurface(runtime, framePath);

    const response = await fetch(`${handle.url}frame`);
    const body = await response.text();

    expect(response.status).toBe(404);
    expect(body).toContain("not-ready");
    expect(body).not.toContain("latest.png");
    expect(body).not.toContain(tempDir);
  });

  it("returns a bounded not-ready response when no frame exists", async () => {
    const runtime = createRuntimeSpy();
    const tempDir = createTempDir();
    const handle = await startSurface(runtime, join(tempDir, "missing.png"));

    const response = await fetch(`${handle.url}frame`);
    const body = await response.text();

    expect(response.status).toBe(404);
    expect(body).toContain("not-ready");
    expect(body).not.toContain("missing.png");
    expect(body).not.toContain(tempDir);
  });

  it("does not serve same-directory temporary frame output files", async () => {
    const runtime = createRuntimeSpy();
    const tempDir = createTempDir();
    const framePath = join(tempDir, "latest.jpg");
    const handle = await startSurface(runtime, framePath);
    const tempFrameBytes = Buffer.from("/9j/4HRlbXAtZnJhbWU=", "base64");
    writeFileSync(join(tempDir, ".latest.jpg.winbridge-123.tmp"), tempFrameBytes);

    const response = await fetch(`${handle.url}frame`);
    const body = await response.text();

    expect(response.status).toBe(404);
    expect(body).toContain("not-ready");
    expect(body).not.toContain("winbridge-123");
    expect(body).not.toContain(tempDir);
  });

  it("sends pointer input through the viewer runtime with metadata-only response", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);

    const response = await postJson(handle, "input", {
      command: "pointer-move 0.5 0.25"
    });
    const body = await response.text();

    expect(response.status).toBe(202);
    expect(body).toContain("\"kind\":\"pointer-move\"");
    expect(body).not.toContain("0.5");
    expect(body).not.toContain("0.25");
    expect(runtime.sendInputEvent).toHaveBeenCalledWith({
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_0",
      sequence: 0,
      event: { kind: "pointer-move", x: 0.5, y: 0.25 }
    });
  });

  it("sends keyboard input without exposing key values", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);

    const response = await postJson(handle, "input", {
      command: "key-down KeyA shift"
    });
    const body = await response.text();

    expect(response.status).toBe(202);
    expect(body).toContain("\"kind\":\"key-down\"");
    expect(body).not.toContain("KeyA");
    expect(body).not.toContain("shift");
    expect(runtime.sendInputEvent).toHaveBeenCalledWith({
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_0",
      sequence: 0,
      event: { kind: "key-down", key: "KeyA", modifiers: ["shift"] }
    });
  });

  it("sends keyboard input with explicit modifiers without exposing modifier values", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);

    const response = await postJson(handle, "input", {
      command: "key-down KeyA shift,control"
    });
    const body = await response.text();

    expect(response.status).toBe(202);
    expect(body).toContain("\"kind\":\"key-down\"");
    expect(body).not.toContain("KeyA");
    expect(body).not.toContain("shift");
    expect(body).not.toContain("control");
    expect(runtime.sendInputEvent).toHaveBeenCalledWith({
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_0",
      sequence: 0,
      event: { kind: "key-down", key: "KeyA", modifiers: ["shift", "control"] }
    });
  });

  it("routes explicit keyboard button commands as ordered key down and key up events", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);

    const down = await postJson(handle, "input", {
      command: "key-down Enter"
    });
    const up = await postJson(handle, "input", {
      command: "key-up Enter"
    });
    const combinedBody = `${await down.text()}\n${await up.text()}`;

    expect(down.status).toBe(202);
    expect(up.status).toBe(202);
    expect(combinedBody).toContain("\"kind\":\"key-down\"");
    expect(combinedBody).toContain("\"kind\":\"key-up\"");
    expect(combinedBody).not.toContain("Enter");
    expect(runtime.sendInputEvent).toHaveBeenNthCalledWith(1, {
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_0",
      sequence: 0,
      event: { kind: "key-down", key: "Enter", modifiers: [] }
    });
    expect(runtime.sendInputEvent).toHaveBeenNthCalledWith(2, {
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_1",
      sequence: 1,
      event: { kind: "key-up", key: "Enter", modifiers: [] }
    });
  });

  it("rejects malformed input before reading authorization state", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await postJson(handle, "input", {
      command: "pointer-down 0.5 0.5 left raw-token"
    });
    const body = await response.text();

    expect(response.status).toBe(400);
    expect(body).toContain("rejected");
    expect(body).not.toContain("0.5");
    expect(body).not.toContain("left");
    expect(body).not.toContain("raw-token");
    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects input without the local mutation token before reading authorization state", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(`${handle.url}input`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: originForHandle(handle)
      },
      body: JSON.stringify({ command: "pointer-move 0.5 0.5" })
    });
    const body = await response.text();

    expect(response.status).toBe(403);
    expect(body).toContain("rejected");
    expect(body).not.toContain("0.5");
    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects input from a foreign origin before reading authorization state", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(`${handle.url}input`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://example.invalid",
        "x-winbridge-local-surface-token": handle.token
      },
      body: JSON.stringify({ command: "pointer-move 0.5 0.5" })
    });
    const body = await response.text();

    expect(response.status).toBe(403);
    expect(body).toContain("rejected");
    expect(body).not.toContain("0.5");
    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects input with unsafe content type before reading authorization state", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(`${handle.url}input`, {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        origin: originForHandle(handle),
        "x-winbridge-local-surface-token": handle.token
      },
      body: JSON.stringify({ command: "pointer-move 0.5 0.5" })
    });
    const body = await response.text();

    expect(response.status).toBe(403);
    expect(body).toContain("rejected");
    expect(body).not.toContain("0.5");
    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects oversized input without echoing the command body", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);
    const rawCommand = `pointer-move ${"0".repeat(1200)} raw-token`;

    const response = await postJson(handle, "input", { command: rawCommand });
    const body = await response.text();

    expect(response.status).toBe(413);
    expect(body).toContain("rejected");
    expect(body).not.toContain(rawCommand);
    expect(body).not.toContain("raw-token");
    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects input without active visible authorization before sending", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue({
      state: "inactive",
      visibleToHost: false,
      permissionCount: 0,
      localInactiveCause: "local-leave"
    });
    const handle = await startSurface(runtime);

    const response = await postJson(handle, "input", {
      command: "pointer-up 0.5 0.5 primary"
    });
    const body = await response.text();

    expect(response.status).toBe(409);
    expect(body).toContain("not-ready");
    expect(body).not.toContain("0.5");
    expect(body).not.toContain("primary");
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("sanitizes runtime input send failures", async () => {
    const rawErrorMessage = "input failed with raw-token at C:\\Users\\Nur\\secret";
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    vi.mocked(runtime.sendInputEvent).mockImplementation(() => {
      throw new Error(rawErrorMessage);
    });
    const handle = await startSurface(runtime);

    const response = await postJson(handle, "input", {
      command: "key-up KeyA"
    });
    const body = await response.text();

    expect(response.status).toBe(409);
    expect(body).toContain(`"messageBytes":${Buffer.byteLength(rawErrorMessage)}`);
    expect(body).not.toContain(rawErrorMessage);
    expect(body).not.toContain("raw-token");
    expect(body).not.toContain("KeyA");
  });

  it("disconnects only the local viewer runtime", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await postJson(handle, "disconnect", {});
    const body = await response.text();

    expect(response.status).toBe(202);
    expect(body).toContain("disconnect");
    expect(runtime.leave).toHaveBeenCalledTimes(1);
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects disconnect without the local mutation token", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(`${handle.url}disconnect`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: originForHandle(handle)
      },
      body: JSON.stringify({})
    });
    const body = await response.text();

    expect(response.status).toBe(403);
    expect(body).toContain("rejected");
    expect(runtime.leave).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("stops the listener without leaving a background surface", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    await handle.stop();
    removeHandle(handle);

    await expect(fetch(`${handle.url}status`)).rejects.toThrow();
  });
});

function createRuntimeSpy(): ViewerLocalControlSurfaceRuntime {
  return {
    getViewerStatus: vi.fn(() => ({
      state: "inactive",
      visibleToHost: false,
      permissionCount: 0
    })),
    leave: vi.fn(async () => undefined),
    sendInputEvent: vi.fn()
  };
}

function createActiveStatus() {
  return {
    state: "active" as const,
    visibleToHost: true,
    permissionCount: 2,
    authorizationStatus: "active" as const,
    authorizationId: "authz_surface_1",
    expiresAt: "2026-06-17T12:00:00.000Z"
  };
}

async function startSurface(
  runtime: ViewerLocalControlSurfaceRuntime,
  framePath = join(createTempDir(), "latest.png")
): Promise<ViewerLocalControlSurfaceHandle> {
  const handle = await startViewerLocalControlSurface(runtime, {
    port: 0,
    framePath
  });
  handles.push(handle);
  return handle;
}

function createTempDir(): string {
  const tempDir = mkdtempSync(join(tmpdir(), "winbridge-surface-"));
  tempDirs.push(tempDir);
  return tempDir;
}

function postJson(
  handle: ViewerLocalControlSurfaceHandle,
  path: "input" | "disconnect",
  body: unknown
): Promise<Response> {
  return fetch(`${handle.url}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: originForHandle(handle),
      "x-winbridge-local-surface-token": handle.token
    },
    body: JSON.stringify(body)
  });
}

function originForHandle(handle: ViewerLocalControlSurfaceHandle): string {
  return handle.url.replace(/\/$/, "");
}

function removeHandle(handle: ViewerLocalControlSurfaceHandle): void {
  const index = handles.indexOf(handle);
  if (index !== -1) {
    handles.splice(index, 1);
  }
}
