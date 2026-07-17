import { existsSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { runInNewContext } from "node:vm";
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
const surfaceFramePaths = new Map<ViewerLocalControlSurfaceHandle, string>();

afterEach(async () => {
  await Promise.all(handles.splice(0).map((handle) => handle.stop()));
  surfaceFramePaths.clear();
  vi.restoreAllMocks();
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
        expiresAt: "2026-06-17T12:00:00.000Z",
        inputPointerReady: false,
        inputKeyboardReady: false
      }
    });
    expect(JSON.stringify(body)).not.toContain("authz_surface_private");
    expect(JSON.stringify(body)).not.toContain("screen:view");
    expect(JSON.stringify(body)).not.toContain("input:pointer");
    expect(JSON.stringify(body)).not.toContain("input:keyboard");
    expect(JSON.stringify(body)).not.toContain("raw-token");
  });

  it("accepts requests with the exact resolved loopback Host header", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);

    const response = await rawSurfaceRequest(handle, "status", {
      headers: { host: new URL(handle.url).host }
    });

    expect(response.status).toBe(200);
    expect(response.body).toContain("\"ok\":true");
    expect(runtime.getViewerStatus).toHaveBeenCalledTimes(1);
  });

  it("rejects mismatched Host headers before serving local read routes", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue({
      state: "active",
      visibleToHost: true,
      permissionCount: 3,
      authorizationStatus: "active",
      authorizationId: "authz_surface_private"
    });
    const tempDir = createTempDir();
    const framePath = join(tempDir, "latest.png");
    const handle = await startSurface(runtime, framePath);
    writeFileSync(framePath, FRAME_BYTES);

    for (const path of ["", "status", "frame"]) {
      const response = await rawSurfaceRequest(handle, path, {
        headers: { host: "rebound.example.invalid:80" }
      });

      expect(response.status).toBe(403);
      expect(response.body).toContain("rejected");
      expect(response.body).not.toContain("WinBridge Viewer");
      expect(response.body).not.toContain("authz_surface_private");
      expect(response.body).not.toContain("rebound.example.invalid");
      expect(response.body).not.toContain(handle.token);
    }

    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
  });

  it("returns bounded input readiness booleans without raw permissions", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue({
      state: "active",
      visibleToHost: true,
      permissionCount: 2,
      authorizationStatus: "active",
      authorizationId: "authz_surface_input_private",
      inputPointerReady: true,
      inputKeyboardReady: true
    });
    const handle = await startSurface(runtime);

    const response = await fetch(`${handle.url}status`);
    const body = await response.json() as {
      ok: true;
      state: Record<string, unknown>;
    };
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(body.state.inputPointerReady).toBe(true);
    expect(body.state.inputKeyboardReady).toBe(true);
    expect(serialized).not.toContain("authz_surface_input_private");
    expect(serialized).not.toContain("screen:view");
    expect(serialized).not.toContain("input:pointer");
    expect(serialized).not.toContain("input:keyboard");
    expect(serialized).not.toContain("raw-token");
  });

  it("represents pointer-only and keyboard-only readiness independently", async () => {
    const pointerRuntime = createRuntimeSpy();
    vi.mocked(pointerRuntime.getViewerStatus).mockReturnValue({
      state: "active",
      visibleToHost: true,
      permissionCount: 1,
      authorizationStatus: "active",
      authorizationId: "authz_pointer_only",
      inputPointerReady: true
    });
    const pointerHandle = await startSurface(pointerRuntime);

    const keyboardRuntime = createRuntimeSpy();
    vi.mocked(keyboardRuntime.getViewerStatus).mockReturnValue({
      state: "active",
      visibleToHost: true,
      permissionCount: 1,
      authorizationStatus: "active",
      authorizationId: "authz_keyboard_only",
      inputKeyboardReady: true
    });
    const keyboardHandle = await startSurface(keyboardRuntime);

    const pointerBody = await (await fetch(`${pointerHandle.url}status`)).json() as {
      state: Record<string, unknown>;
    };
    const keyboardBody = await (await fetch(`${keyboardHandle.url}status`)).json() as {
      state: Record<string, unknown>;
    };
    const serialized = `${JSON.stringify(pointerBody)}\n${JSON.stringify(keyboardBody)}`;

    expect(pointerBody.state.inputPointerReady).toBe(true);
    expect(pointerBody.state.inputKeyboardReady).toBe(false);
    expect(keyboardBody.state.inputPointerReady).toBe(false);
    expect(keyboardBody.state.inputKeyboardReady).toBe(true);
    expect(serialized).not.toContain("authz_pointer_only");
    expect(serialized).not.toContain("authz_keyboard_only");
    expect(serialized).not.toContain("input:pointer");
    expect(serialized).not.toContain("input:keyboard");
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
    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
      expect(html).toContain(`data-key-command="Key${letter}"`);
      expect(html).toContain(`>${letter}</button>`);
    }
    for (let digit = 0; digit <= 9; digit += 1) {
      expect(html).toContain(`data-key-command="Digit${digit}"`);
      expect(html).toContain(`>${digit}</button>`);
    }
    expect(html).toContain('data-key-command="Space"');
    expect(html).toContain(">Space</button>");
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
    expect(html).not.toContain("contenteditable");
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
    expect(html).toContain("const disabled = !isLocalKeyboardReady();");
    expect(html).toContain("button.disabled = disabled;");
    expect(html).toContain("function clearModifiers()");
    expect(html).toContain("activeModifiers.clear();");
    expect(html).toContain("const modifiers = Array.from(activeModifiers).join(\",\");");
    expect(html).toContain('const suffix = modifiers ? " " + modifiers : "";');
    expect(html).toContain("return enqueueInputOperation(async () => {");
    expect(html).toContain("await sendCommandNow(\"key-down \" + key + suffix, generation);");
    expect(html).toContain("await sendCommandNow(\"key-up \" + key + suffix, generation);");
    expect(html).toMatch(/finally \{\s+clearModifiers\(\);\s+\}/);
    expect(html).toContain('button.addEventListener("click", () => {');
    expect(html).toContain("if (!isLocalKeyboardReady()) return;");
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
    expect(html).toContain("let frameFresh = false;");
    expect(html).toContain("let statusPointerReady = false;");
    expect(html).toContain("let statusKeyboardReady = false;");
    expect(html).toContain("let frameRequestSequence = 0;");
    expect(html).toContain("function isLocalPointerReady()");
    expect(html).toContain("return frameReady && frameFresh && statusPointerReady;");
    expect(html).toContain("function updatePointerArm()");
    expect(html).toContain('pointerArm.setAttribute("aria-pressed", pointerArmed ? "true" : "false")');
    expect(html).toContain("pointerArm.disabled = !isLocalPointerReady();");
    expect(html).toContain('pointerArm.addEventListener("click"');
    expect(html).toContain("if (!isLocalPointerReady()) return;");
    expect(html).toContain("pointerArmed = !pointerArmed;");
    expect(html.match(/if \(!pointerArmed \|\| !isLocalPointerReady\(\)\) return;/g)).toHaveLength(3);
    expect(html).toContain("&& !heldPointerButtons.has(button)) return;");
    expect(html.match(/pointerArmed = false;/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("frameReady = true;");
    expect(html).toContain('frameStatus.textContent = frameReady ? "frame=refreshing" : "frame=loading"');
    expect(html).toContain('frameStatus.textContent = "frame=not-ready"');
    expect(html).not.toContain("document.addEventListener(\"pointer");
    expect(html).not.toContain("window.addEventListener(\"pointer");
  });

  it("executes generated pointer down and up through one ordered browser queue", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);
    const html = await (await fetch(handle.url)).text();
    const firstResponse = createDeferred<GeneratedBrowserResponse>();
    const inputCommands: string[] = [];
    const browser = await executeGeneratedViewerScript(html, async (path, init) => {
      expect(path).toBe("/input");
      const command = JSON.parse(String(init?.body)).command as string;
      inputCommands.push(command);
      if (inputCommands.length === 1) {
        return firstResponse.promise;
      }
      return generatedBrowserJsonResponse({ ok: true, action: "input", kind: "pointer-up" });
    });

    browser.pointerArm.emit("click", {});
    browser.frame.emit("pointerdown", generatedPointerEvent());
    browser.frame.emit("pointerup", generatedPointerEvent());
    await flushGeneratedBrowserTasks();

    expect(inputCommands).toEqual(["pointer-down 0.5 0.5 primary"]);
    firstResponse.resolve(
      generatedBrowserJsonResponse({ ok: true, action: "input", kind: "pointer-down" })
    );
    await flushGeneratedBrowserTasks();

    expect(inputCommands).toEqual([
      "pointer-down 0.5 0.5 primary",
      "pointer-up 0.5 0.5 primary"
    ]);
  });

  it("executes server-authoritative cleanup after an ambiguous browser down response", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);
    const html = await (await fetch(handle.url)).text();
    const downResponse = createDeferred<GeneratedBrowserResponse>();
    const paths: string[] = [];
    const browser = await executeGeneratedViewerScript(html, async (path) => {
      paths.push(path);
      if (path === "/input") {
        return downResponse.promise;
      }
      expect(path).toBe("/release-input");
      return generatedBrowserJsonResponse({ ok: true, action: "release-input" });
    });

    browser.pointerArm.emit("click", {});
    browser.frame.emit("pointerdown", generatedPointerEvent());
    await flushGeneratedBrowserTasks();
    expect(paths).toEqual(["/input"]);

    downResponse.reject(new Error("response-lost"));
    await flushGeneratedBrowserTasks();
    expect(paths).toEqual(["/input", "/release-input"]);
  });

  it("executes server-authoritative cleanup after an unreadable browser down response", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);
    const html = await (await fetch(handle.url)).text();
    const paths: string[] = [];
    const browser = await executeGeneratedViewerScript(html, async (path) => {
      paths.push(path);
      if (path === "/input") {
        return {
          ok: true,
          status: 202,
          json: async () => Promise.reject(new Error("response-body-lost"))
        };
      }
      expect(path).toBe("/release-input");
      return generatedBrowserJsonResponse({ ok: true, action: "release-input" });
    });

    browser.pointerArm.emit("click", {});
    browser.frame.emit("pointerdown", generatedPointerEvent());
    await flushGeneratedBrowserTasks();

    expect(paths).toEqual(["/input", "/release-input"]);
  });

  it("renders local input controls gated on sanitized status and displayed frame readiness", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("let statusPointerReady = false;");
    expect(html).toContain("let statusKeyboardReady = false;");
    expect(html).toContain("let displayedFrameGeneration = undefined;");
    expect(html).toContain("function isAnyLocalInputReady()");
    expect(html).toContain("return isLocalPointerReady() || isLocalKeyboardReady();");
    expect(html).toContain(
      'statusPointerReady = body.state.state === "active" && body.state.visibleToHost === true && body.state.inputPointerReady === true;',
    );
    expect(html).toContain(
      'statusKeyboardReady = body.state.state === "active" && body.state.visibleToHost === true && body.state.inputKeyboardReady === true;',
    );
    expect(html).toContain(
      'status.textContent = "state=" + body.state.state + " visibleToHost=" + body.state.visibleToHost + " permissionCount=" + body.state.permissionCount + " pointerReady=" + statusPointerReady + " keyboardReady=" + statusKeyboardReady + signalAck;',
    );
    expect(html).toContain('const keyCommandButtons = Array.from(document.querySelectorAll("[data-key-command]"));');
    expect(html).toContain("function updateInputControls()");
    expect(html).toContain("sendButton.disabled = !isAnyLocalInputReady();");
    expect(html).toContain("for (const button of keyCommandButtons)");
    expect(html).toContain("button.disabled = !isLocalKeyboardReady();");
    expect(html).toContain("updateInputControls();");
    expect(html).toContain('if (event.key === "Enter")');
    expect(html).toContain("if (!isAnyLocalInputReady()) return;");
    expect(html).toContain(
      'postJson("/input", { command: line, frameGeneration: generation })'
    );
    expect(html).not.toContain("authorizationId");
    expect(html).not.toContain("raw-token");
    expect(html).not.toContain("pairingCode");
  });

  it("decodes replacement generations before replacing the displayed frame", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("const frameUrl = \"/frame?t=\" + Date.now();");
    expect(html).toContain("const requestSequence = ++frameRequestSequence;");
    expect(html).toContain('const generation = response.headers.get("x-winbridge-frame-generation");');
    expect(html).toContain("if (generation === displayedFrameGeneration)");
    expect(html).toContain("const frameBlob = await response.blob();");
    expect(html).toContain("const nextFrameObjectUrl = URL.createObjectURL(frameBlob);");
    expect(html).toContain("const nextFrame = new Image();");
    expect(html).toContain('nextFrame.addEventListener("load"');
    expect(html).toContain('nextFrame.addEventListener("error"');
    expect(html.match(/if \(requestSequence !== frameRequestSequence\) return;/g)?.length).toBeGreaterThanOrEqual(3);
    expect(html).toContain("frame.src = nextFrameObjectUrl;");
    expect(html).toContain("nextFrame.src = nextFrameObjectUrl;");
    expect(html).toContain("displayedFrameGeneration = generation;");
    expect(html).toContain("URL.revokeObjectURL(previousFrameObjectUrl);");
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
    expect(contentSecurityPolicy).toContain("img-src 'self' blob:");
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
    expect(html).toContain("displayedFrameLoadedAt = performance.now();");
    expect(html).toContain("frameFresh = !stale;");
    expect(html).toContain("activeModifiers.clear();");
    expect(html).toContain("void releaseHeldInputs();");
    expect(html).toContain("const heldKeys = new Set();");
    expect(html).toContain("const heldPointerButtons = new Set();");
    expect(html).toContain("let inputOperationQueue = Promise.resolve();");
    expect(html).toContain("inputOperationQueue = result.then(() => undefined, () => undefined);");
    expect(html).toContain('const body = await postJson("/release-input", {});');
    expect(html).toContain('window.addEventListener("pagehide", () => {');
    expect(html).not.toContain("lastAcceptedPointerPoint");
    expect(html).not.toContain("releaseRequestsInFlight");
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
    expect(response.headers.get("x-winbridge-frame-generation")).toMatch(/^[A-Za-z0-9_-]{22}$/);
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

  it("keeps one opaque generation for repeated reads of an unchanged frame", async () => {
    const runtime = createRuntimeSpy();
    const tempDir = createTempDir();
    const framePath = join(tempDir, "latest.png");
    const handle = await startSurface(runtime, framePath);
    writeFileSync(framePath, FRAME_BYTES);

    const firstGeneration = await readFrameGeneration(handle);
    const secondGeneration = await readFrameGeneration(handle);

    expect(firstGeneration).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(secondGeneration).toBe(firstGeneration);
  });

  it("rejects missing malformed and extra generation evidence before runtime input", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);
    const invalidBodies = [
      { command: "pointer-move 0.5 0.5" },
      { command: "pointer-move 0.5 0.5", frameGeneration: "" },
      { command: "pointer-move 0.5 0.5", frameGeneration: "unsafe/raw-generation" },
      { command: "pointer-move 0.5 0.5", frameGeneration: "a".repeat(23) },
      { command: "pointer-move 0.5 0.5", frameGeneration: {} },
      {
        command: "pointer-move 0.5 0.5",
        frameGeneration: "a".repeat(22),
        extra: "raw-token"
      }
    ];

    for (const invalidBody of invalidBodies) {
      const response = await postRawJson(handle, "input", invalidBody);
      const body = await response.text();

      expect(response.status).toBe(400);
      expect(body).toContain("rejected");
      expect(body).not.toContain("raw-generation");
      expect(body).not.toContain("raw-token");
    }
    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects unseen generation evidence without a frame or runtime input", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);

    const response = await postRawJson(handle, "input", {
      command: "key-down KeyA",
      frameGeneration: "a".repeat(22)
    });
    const body = await response.text();

    expect(response.status).toBe(409);
    expect(body).toContain("not-ready");
    expect(body).not.toContain("KeyA");
    expect(body).not.toContain("a".repeat(22));
    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects an unchanged generation after the monotonic freshness window", async () => {
    const now = vi.spyOn(performance, "now").mockReturnValue(1_000);
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const tempDir = createTempDir();
    const framePath = join(tempDir, "latest.png");
    const handle = await startSurface(runtime, framePath);
    writeFileSync(framePath, FRAME_BYTES);
    const generation = await readFrameGeneration(handle);

    const fresh = await postRawJson(handle, "input", {
      command: "pointer-move 0.25 0.75",
      frameGeneration: generation
    });
    now.mockReturnValue(6_000);
    const stale = await postRawJson(handle, "input", {
      command: "pointer-move 0.5 0.5",
      frameGeneration: generation
    });
    const staleBody = await stale.text();

    expect(fresh.status).toBe(202);
    expect(stale.status).toBe(409);
    expect(staleBody).toContain("not-ready");
    expect(staleBody).not.toContain(generation);
    expect(runtime.sendInputEvent).toHaveBeenCalledTimes(1);
  });

  it("linearly supersedes the old generation only after publishing a replacement", async () => {
    const now = vi.spyOn(performance, "now").mockReturnValue(1_000);
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const tempDir = createTempDir();
    const framePath = join(tempDir, "latest.png");
    const handle = await startSurface(runtime, framePath);
    writeFileSync(framePath, FRAME_BYTES);
    const firstGeneration = await readFrameGeneration(handle);

    const replacementPath = join(tempDir, ".latest.png.replacement.tmp");
    writeFileSync(replacementPath, JPEG_FRAME_BYTES);
    renameSync(replacementPath, framePath);
    now.mockReturnValue(2_000);

    const beforePublication = await postRawJson(handle, "input", {
      command: "pointer-move 0.5 0.5",
      frameGeneration: firstGeneration
    });
    const secondGeneration = await readFrameGeneration(handle);
    const superseded = await postRawJson(handle, "input", {
      command: "pointer-move 0.5 0.5",
      frameGeneration: firstGeneration
    });
    const recovered = await postRawJson(handle, "input", {
      command: "pointer-move 0.75 0.25",
      frameGeneration: secondGeneration
    });

    expect(beforePublication.status).toBe(202);
    expect(secondGeneration).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(secondGeneration).not.toBe(firstGeneration);
    expect(superseded.status).toBe(409);
    expect(recovered.status).toBe(202);
    expect(runtime.sendInputEvent).toHaveBeenCalledTimes(2);
  });

  it("allows one matching key release but no new or duplicate stale key input", async () => {
    const now = vi.spyOn(performance, "now").mockReturnValue(1_000);
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);
    const generation = await ensureFreshFrameGeneration(handle);

    const down = await postRawJson(handle, "input", {
      command: "key-down KeyA shift",
      frameGeneration: generation
    });
    now.mockReturnValue(6_000);
    const release = await postRawJson(handle, "input", {
      command: "key-up KeyA shift",
      frameGeneration: generation
    });
    const duplicateRelease = await postRawJson(handle, "input", {
      command: "key-up KeyA",
      frameGeneration: generation
    });
    const newDown = await postRawJson(handle, "input", {
      command: "key-down KeyB",
      frameGeneration: generation
    });

    expect(down.status).toBe(202);
    expect(release.status).toBe(202);
    expect(duplicateRelease.status).toBe(409);
    expect(newDown.status).toBe(409);
    expect(runtime.sendInputEvent).toHaveBeenCalledTimes(2);
    expect(runtime.sendInputEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        event: { kind: "key-up", key: "KeyA", modifiers: [] }
      })
    );
  });

  it("uses last accepted fresh coordinates for one stale pointer release", async () => {
    const now = vi.spyOn(performance, "now").mockReturnValue(1_000);
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);
    const generation = await ensureFreshFrameGeneration(handle);

    await postRawJson(handle, "input", {
      command: "pointer-down 0.25 0.75 primary",
      frameGeneration: generation
    });
    await postRawJson(handle, "input", {
      command: "pointer-move 0.4 0.6",
      frameGeneration: generation
    });
    now.mockReturnValue(6_000);
    const release = await postRawJson(handle, "input", {
      command: "pointer-up 0.99 0.99 primary",
      frameGeneration: generation
    });
    const duplicate = await postRawJson(handle, "input", {
      command: "pointer-up 0.99 0.99 primary",
      frameGeneration: generation
    });

    expect(release.status).toBe(202);
    expect(duplicate.status).toBe(409);
    expect(runtime.sendInputEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        event: {
          kind: "pointer-up",
          x: 0.4,
          y: 0.6,
          button: "primary"
        }
      })
    );
  });

  it("releases only server-tracked held input through the release-only action", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);
    const generation = await ensureFreshFrameGeneration(handle);

    await postRawJson(handle, "input", {
      command: "key-down KeyA shift",
      frameGeneration: generation
    });
    await postRawJson(handle, "input", {
      command: "pointer-down 0.25 0.75 primary",
      frameGeneration: generation
    });
    await postRawJson(handle, "input", {
      command: "pointer-move 0.4 0.6",
      frameGeneration: generation
    });

    const release = await postRawJson(handle, "release-input", {});
    const releaseBody = await release.text();
    const duplicate = await postRawJson(handle, "release-input", {});

    expect(release.status).toBe(202);
    expect(releaseBody).toBe('{"ok":true,"action":"release-input"}');
    expect(releaseBody).not.toContain("KeyA");
    expect(releaseBody).not.toContain(generation);
    expect(duplicate.status).toBe(202);
    expect(runtime.sendInputEvent).toHaveBeenCalledTimes(5);
    expect(runtime.sendInputEvent).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        event: { kind: "key-up", key: "KeyA", modifiers: [] }
      })
    );
    expect(runtime.sendInputEvent).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        event: {
          kind: "pointer-up",
          x: 0.4,
          y: 0.6,
          button: "primary"
        }
      })
    );
  });

  it("rejects malformed release-only requests before runtime input", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);

    const response = await postRawJson(handle, "release-input", {
      command: "key-up KeyA",
      privateValue: "raw-token"
    });
    const body = await response.text();

    expect(response.status).toBe(400);
    expect(body).toContain("rejected");
    expect(body).not.toContain("KeyA");
    expect(body).not.toContain("raw-token");
    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("releases abandoned held input at the generation stale boundary", async () => {
    const now = vi.spyOn(performance, "now").mockReturnValue(1_000);
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);
    const generation = await ensureFreshFrameGeneration(handle);
    now.mockReturnValue(5_999);

    const down = await postRawJson(handle, "input", {
      command: "key-down KeyA",
      frameGeneration: generation
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(down.status).toBe(202);
    expect(runtime.sendInputEvent).toHaveBeenCalledTimes(2);
    expect(runtime.sendInputEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        event: { kind: "key-up", key: "KeyA", modifiers: [] }
      })
    );
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

  it("routes alphanumeric and space key palette commands without exposing key values", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);

    const aDown = await postJson(handle, "input", {
      command: "key-down KeyA shift"
    });
    const aUp = await postJson(handle, "input", {
      command: "key-up KeyA shift"
    });
    const digitDown = await postJson(handle, "input", {
      command: "key-down Digit7"
    });
    const digitUp = await postJson(handle, "input", {
      command: "key-up Digit7"
    });
    const spaceDown = await postJson(handle, "input", {
      command: "key-down Space"
    });
    const spaceUp = await postJson(handle, "input", {
      command: "key-up Space"
    });
    const combinedBody = [
      await aDown.text(),
      await aUp.text(),
      await digitDown.text(),
      await digitUp.text(),
      await spaceDown.text(),
      await spaceUp.text()
    ].join("\n");

    expect(aDown.status).toBe(202);
    expect(aUp.status).toBe(202);
    expect(digitDown.status).toBe(202);
    expect(digitUp.status).toBe(202);
    expect(spaceDown.status).toBe(202);
    expect(spaceUp.status).toBe(202);
    expect(combinedBody).toContain("\"kind\":\"key-down\"");
    expect(combinedBody).toContain("\"kind\":\"key-up\"");
    expect(combinedBody).not.toContain("KeyA");
    expect(combinedBody).not.toContain("Digit7");
    expect(combinedBody).not.toContain("Space");
    expect(combinedBody).not.toContain("shift");
    expect(runtime.sendInputEvent).toHaveBeenNthCalledWith(1, {
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_0",
      sequence: 0,
      event: { kind: "key-down", key: "KeyA", modifiers: ["shift"] }
    });
    expect(runtime.sendInputEvent).toHaveBeenNthCalledWith(2, {
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_1",
      sequence: 1,
      event: { kind: "key-up", key: "KeyA", modifiers: ["shift"] }
    });
    expect(runtime.sendInputEvent).toHaveBeenNthCalledWith(3, {
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_2",
      sequence: 2,
      event: { kind: "key-down", key: "Digit7", modifiers: [] }
    });
    expect(runtime.sendInputEvent).toHaveBeenNthCalledWith(4, {
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_3",
      sequence: 3,
      event: { kind: "key-up", key: "Digit7", modifiers: [] }
    });
    expect(runtime.sendInputEvent).toHaveBeenNthCalledWith(5, {
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_4",
      sequence: 4,
      event: { kind: "key-down", key: "Space", modifiers: [] }
    });
    expect(runtime.sendInputEvent).toHaveBeenNthCalledWith(6, {
      authorizationId: "authz_surface_1",
      eventId: "viewer_control_input_5",
      sequence: 5,
      event: { kind: "key-up", key: "Space", modifiers: [] }
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

  it("rejects input with a missing Host header before reading authorization state", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);

    const response = await rawSurfaceRequest(handle, "input", {
      method: "POST",
      setHost: false,
      headers: {
        "content-type": "application/json",
        origin: originForHandle(handle),
        "x-winbridge-local-surface-token": handle.token
      },
      body: JSON.stringify({ command: "pointer-move 0.5 0.5" })
    });

    expect(response.status).toBe(403);
    expect(response.body).toContain("rejected");
    expect(response.body).not.toContain("0.5");
    expect(response.body).not.toContain(handle.token);
    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects input with a mismatched Host header before reading authorization state", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);

    const response = await rawSurfaceRequest(handle, "input", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "rebound.example.invalid:80",
        origin: originForHandle(handle),
        "x-winbridge-local-surface-token": handle.token
      },
      body: JSON.stringify({ command: "key-down KeyA" })
    });

    expect(response.status).toBe(403);
    expect(response.body).toContain("rejected");
    expect(response.body).not.toContain("KeyA");
    expect(response.body).not.toContain("rebound.example.invalid");
    expect(response.body).not.toContain(handle.token);
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

  it("attempts server-tracked release before disconnecting", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue(createActiveStatus());
    const handle = await startSurface(runtime);
    const generation = await ensureFreshFrameGeneration(handle);
    await postRawJson(handle, "input", {
      command: "key-down KeyA",
      frameGeneration: generation
    });

    const response = await postJson(handle, "disconnect", {});

    expect(response.status).toBe(202);
    expect(runtime.sendInputEvent).toHaveBeenCalledTimes(2);
    expect(runtime.sendInputEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        event: { kind: "key-up", key: "KeyA", modifiers: [] }
      })
    );
    expect(vi.mocked(runtime.sendInputEvent).mock.invocationCallOrder[1]).toBeLessThan(
      vi.mocked(runtime.leave).mock.invocationCallOrder[0]
    );
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

  it("rejects disconnect with a mismatched Host header before leaving", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await rawSurfaceRequest(handle, "disconnect", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "rebound.example.invalid:80",
        origin: originForHandle(handle),
        "x-winbridge-local-surface-token": handle.token
      },
      body: JSON.stringify({})
    });

    expect(response.status).toBe(403);
    expect(response.body).toContain("rejected");
    expect(response.body).not.toContain("rebound.example.invalid");
    expect(response.body).not.toContain(handle.token);
    expect(runtime.leave).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects disconnect from a foreign origin before leaving", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(`${handle.url}disconnect`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://example.invalid",
        "x-winbridge-local-surface-token": handle.token
      },
      body: JSON.stringify({})
    });
    const body = await response.text();

    expect(response.status).toBe(403);
    expect(body).toContain("rejected");
    expect(body).not.toContain(handle.token);
    expect(body).not.toContain("example.invalid");
    expect(runtime.leave).not.toHaveBeenCalled();
    expect(runtime.sendInputEvent).not.toHaveBeenCalled();
  });

  it("rejects disconnect with an unsafe content type before leaving", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(`${handle.url}disconnect`, {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        origin: originForHandle(handle),
        "x-winbridge-local-surface-token": handle.token
      },
      body: "{}"
    });
    const body = await response.text();

    expect(response.status).toBe(403);
    expect(body).toContain("rejected");
    expect(body).not.toContain(handle.token);
    expect(body).not.toContain("text/plain");
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
  surfaceFramePaths.set(handle, framePath);
  return handle;
}

function createTempDir(): string {
  const tempDir = mkdtempSync(join(tmpdir(), "winbridge-surface-"));
  tempDirs.push(tempDir);
  return tempDir;
}

async function postJson(
  handle: ViewerLocalControlSurfaceHandle,
  path: "input" | "release-input" | "disconnect",
  body: unknown
): Promise<Response> {
  let requestBody = body;
  if (path === "input" && isCommandOnlyBody(body)) {
    requestBody = {
      ...body,
      frameGeneration: await ensureFreshFrameGeneration(handle)
    };
  }

  return postRawJson(handle, path, requestBody);
}

function postRawJson(
  handle: ViewerLocalControlSurfaceHandle,
  path: "input" | "release-input" | "disconnect",
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

function isCommandOnlyBody(body: unknown): body is { command: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body) &&
    typeof (body as { command?: unknown }).command === "string" &&
    !("frameGeneration" in body)
  );
}

async function ensureFreshFrameGeneration(
  handle: ViewerLocalControlSurfaceHandle
): Promise<string> {
  const framePath = surfaceFramePaths.get(handle);
  if (!framePath) {
    throw new Error("Missing test frame path");
  }
  if (!existsSync(framePath)) {
    writeFileSync(framePath, FRAME_BYTES);
  }

  return readFrameGeneration(handle);
}

async function readFrameGeneration(handle: ViewerLocalControlSurfaceHandle): Promise<string> {
  const response = await fetch(`${handle.url}frame`);
  await response.arrayBuffer();
  const generation = response.headers.get("x-winbridge-frame-generation");
  if (response.status !== 200 || !generation) {
    throw new Error("Missing test frame generation");
  }
  return generation;
}

function rawSurfaceRequest(
  handle: ViewerLocalControlSurfaceHandle,
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    setHost?: boolean;
  } = {}
): Promise<{ status: number; body: string }> {
  const surfaceUrl = new URL(handle.url);
  const requestPath = `/${path.replace(/^\//, "")}`;
  return new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        hostname: surfaceUrl.hostname,
        port: Number(surfaceUrl.port),
        path: requestPath,
        method: options.method ?? "GET",
        headers: options.headers,
        setHost: options.setHost ?? true
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8")
          });
        });
      }
    );
    request.on("error", reject);
    if (options.body) {
      request.end(options.body);
    } else {
      request.end();
    }
  });
}

function originForHandle(handle: ViewerLocalControlSurfaceHandle): string {
  return handle.url.replace(/\/$/, "");
}

function removeHandle(handle: ViewerLocalControlSurfaceHandle): void {
  surfaceFramePaths.delete(handle);
  const index = handles.indexOf(handle);
  if (index !== -1) {
    handles.splice(index, 1);
  }
}

type GeneratedBrowserResponse = {
  ok?: boolean;
  status?: number;
  headers?: { get(name: string): string | null };
  body?: { cancel(): Promise<void> };
  json?(): Promise<unknown>;
  blob?(): Promise<{ type: string }>;
};

type GeneratedBrowserMutationFetch = (
  path: string,
  init?: RequestInit
) => Promise<GeneratedBrowserResponse>;

type GeneratedBrowserListener = (event: Record<string, unknown>) => void;

class GeneratedBrowserElement {
  textContent = "";
  disabled = false;
  value = "";
  dataset: Record<string, string> = {};
  private readonly listeners = new Map<string, GeneratedBrowserListener[]>();

  addEventListener(type: string, listener: GeneratedBrowserListener): void {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  emit(type: string, event: Record<string, unknown>): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }

  setAttribute(): void {}

  getBoundingClientRect(): { left: number; top: number; width: number; height: number } {
    return { left: 0, top: 0, width: 100, height: 100 };
  }

  setPointerCapture(): void {}
}

class GeneratedBrowserImage extends GeneratedBrowserElement {
  private imageSource = "";

  set src(value: string) {
    this.imageSource = value;
    queueMicrotask(() => this.emit("load", {}));
  }

  get src(): string {
    return this.imageSource;
  }
}

async function executeGeneratedViewerScript(
  html: string,
  mutationFetch: GeneratedBrowserMutationFetch
): Promise<{ frame: GeneratedBrowserElement; pointerArm: GeneratedBrowserElement }> {
  const script = html.match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)?.[1];
  if (!script) {
    throw new Error("Missing generated viewer script");
  }

  const elements = new Map<string, GeneratedBrowserElement>();
  for (const id of ["frame", "status", "frameStatus", "pointerArm", "command", "send", "disconnect"]) {
    elements.set(id, new GeneratedBrowserElement());
  }
  const frame = elements.get("frame")!;
  const pointerArm = elements.get("pointerArm")!;
  const windowElement = new GeneratedBrowserElement();
  const fetchImpl = async (path: string, init?: RequestInit): Promise<GeneratedBrowserResponse> => {
    if (path === "/status") {
      return generatedBrowserJsonResponse({
        ok: true,
        state: {
          state: "active",
          visibleToHost: true,
          permissionCount: 3,
          inputPointerReady: true,
          inputKeyboardReady: true,
          signalProbeAckReceived: true
        }
      });
    }
    if (path.startsWith("/frame?t=")) {
      return {
        ok: true,
        status: 200,
        headers: { get: (name) => name === "x-winbridge-frame-generation" ? "a".repeat(22) : null },
        body: { cancel: async () => undefined },
        blob: async () => ({ type: "image/png" })
      };
    }
    return mutationFetch(path, init);
  };

  runInNewContext(script, {
    console,
    document: {
      getElementById: (id: string) => elements.get(id),
      querySelectorAll: () => []
    },
    fetch: fetchImpl,
    Image: GeneratedBrowserImage,
    performance: { now: () => 1_000 },
    setInterval: () => 1,
    clearInterval: () => undefined,
    URL: {
      createObjectURL: () => "blob:winbridge-frame",
      revokeObjectURL: () => undefined
    },
    window: windowElement
  });
  await flushGeneratedBrowserTasks();
  return { frame, pointerArm };
}

function generatedBrowserJsonResponse(body: unknown): GeneratedBrowserResponse {
  return {
    ok: true,
    status: 200,
    json: async () => body
  };
}

function generatedPointerEvent(): Record<string, unknown> {
  return {
    button: 0,
    pointerId: 1,
    clientX: 50,
    clientY: 50,
    preventDefault: () => undefined
  };
}

function createDeferred<T>(): {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}

async function flushGeneratedBrowserTasks(): Promise<void> {
  for (let index = 0; index < 8; index += 1) {
    await Promise.resolve();
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
  for (let index = 0; index < 8; index += 1) {
    await Promise.resolve();
  }
}
