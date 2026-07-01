import { request as httpRequest } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  HostLocalControlSurfaceHandle,
  HostLocalControlSurfaceRuntime
} from "./host-local-control-surface.js";
import { startHostLocalControlSurface } from "./host-local-control-surface.js";

const handles: HostLocalControlSurfaceHandle[] = [];

afterEach(async () => {
  await Promise.all(handles.splice(0).map((handle) => handle.stop()));
});

describe("host local control surface", () => {
  it("starts on loopback and returns sanitized host status", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getHostStatus).mockReturnValue({
      state: "active",
      visibleToHost: true,
      permissionCount: 3,
      authorizationStatus: "active",
      authorizationId: "authz_host_surface_private",
      expiresAt: "2026-06-17T12:00:00.000Z",
      viewerDeviceId: "dev_viewer_1",
      viewerDevicePlatform: "windows"
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
        viewerDeviceId: "dev_viewer_1",
        viewerDevicePlatform: "windows"
      }
    });
    expect(JSON.stringify(body)).not.toContain("authz_host_surface_private");
    expect(JSON.stringify(body)).not.toContain("screen:view");
    expect(JSON.stringify(body)).not.toContain("raw-token");
  });

  it("renders no-store HTML with nonce CSP without exposing the token in headers", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(handle.url);
    const html = await response.text();
    const contentSecurityPolicy = response.headers.get("content-security-policy") ?? "";
    const headers = Array.from(response.headers.entries())
      .map(([name, value]) => `${name}: ${value}`)
      .join("\n");

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(contentSecurityPolicy).toContain("default-src 'none'");
    expect(contentSecurityPolicy).toContain("connect-src 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).not.toContain("'unsafe-inline'");
    expect(html).toContain("WinBridge Host");
    expect(html).toContain("data-command=\"pause\"");
    expect(html).toContain("data-command=\"revoke screen:view\"");
    expect(html).not.toContain("authorizationId");
    expect(html).not.toContain("raw-token");
    expect(headers).not.toContain(handle.token);
  });

  it("rejects mismatched Host headers before serving status or HTML", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getHostStatus).mockReturnValue({
      state: "active",
      visibleToHost: true,
      permissionCount: 1,
      authorizationId: "authz_host_surface_private"
    });
    const handle = await startSurface(runtime);

    for (const path of ["", "status"]) {
      const response = await rawSurfaceRequest(handle, path, {
        headers: { host: "rebound.example.invalid:80" }
      });

      expect(response.status).toBe(403);
      expect(response.body).toContain("rejected");
      expect(response.body).not.toContain("WinBridge Host");
      expect(response.body).not.toContain("authz_host_surface_private");
      expect(response.body).not.toContain("rebound.example.invalid");
      expect(response.body).not.toContain(handle.token);
    }

    expect(runtime.getHostStatus).not.toHaveBeenCalled();
  });

  it("routes accepted lifecycle commands through host runtime controls", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const pause = await postJson(handle, { command: "pause" });
    const resume = await postJson(handle, { command: "resume" });
    const revoke = await postJson(handle, { command: "revoke input:pointer" });

    expect(pause.status).toBe(202);
    expect(await pause.text()).toContain("\"action\":\"pause\"");
    expect(resume.status).toBe(202);
    expect(await resume.text()).toContain("\"action\":\"resume\"");
    expect(revoke.status).toBe(202);
    expect(await revoke.text()).toContain("\"action\":\"revoke\"");
    expect(runtime.pause).toHaveBeenCalledTimes(1);
    expect(runtime.resume).toHaveBeenCalledTimes(1);
    expect(runtime.revokePermission).toHaveBeenCalledWith("input:pointer");
    expect(runtime.terminate).not.toHaveBeenCalled();
    expect(runtime.disconnect).not.toHaveBeenCalled();
  });

  it("rejects controls without the local mutation token before reading host status", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await fetch(`${handle.url}control`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: originForHandle(handle)
      },
      body: JSON.stringify({ command: "pause" })
    });
    const body = await response.text();

    expect(response.status).toBe(403);
    expect(body).toContain("rejected");
    expect(body).not.toContain("pause");
    expect(runtime.getHostStatus).not.toHaveBeenCalled();
    expect(runtime.pause).not.toHaveBeenCalled();
  });

  it("rejects controls with mismatched Host before invoking lifecycle controls", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const response = await rawSurfaceRequest(handle, "control", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "rebound.example.invalid:80",
        origin: originForHandle(handle),
        "x-winbridge-local-surface-token": handle.token
      },
      body: JSON.stringify({ command: "terminate" })
    });

    expect(response.status).toBe(403);
    expect(response.body).toContain("rejected");
    expect(response.body).not.toContain("terminate");
    expect(response.body).not.toContain("rebound.example.invalid");
    expect(response.body).not.toContain(handle.token);
    expect(runtime.terminate).not.toHaveBeenCalled();
  });

  it("rejects controls with foreign Origin or unsafe content type", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    const foreignOrigin = await fetch(`${handle.url}control`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://example.invalid",
        "x-winbridge-local-surface-token": handle.token
      },
      body: JSON.stringify({ command: "pause" })
    });
    const textPlain = await fetch(`${handle.url}control`, {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        origin: originForHandle(handle),
        "x-winbridge-local-surface-token": handle.token
      },
      body: JSON.stringify({ command: "resume" })
    });

    expect(foreignOrigin.status).toBe(403);
    expect(await foreignOrigin.text()).not.toContain("pause");
    expect(textPlain.status).toBe(403);
    expect(await textPlain.text()).not.toContain("resume");
    expect(runtime.pause).not.toHaveBeenCalled();
    expect(runtime.resume).not.toHaveBeenCalled();
  });

  it("rejects malformed and non-lifecycle commands without echoing command contents", async () => {
    const runtime = createRuntimeSpy();
    const handle = await startSurface(runtime);

    for (const body of [
      { command: "status" },
      { command: "help" },
      { command: "revoke diagnostics:view" },
      { command: "pause raw-token" },
      { command: `pause ${"x".repeat(300)}` },
      { command: "" },
      { other: "pause" }
    ]) {
      const response = await postJson(handle, body);
      const text = await response.text();

      expect([400, 413]).toContain(response.status);
      expect(text).toContain("rejected");
      expect(text).not.toContain("diagnostics:view");
      expect(text).not.toContain("pause raw-token");
      expect(text).not.toContain("raw-token");
    }

    expect(runtime.getHostStatus).not.toHaveBeenCalled();
    expect(runtime.pause).not.toHaveBeenCalled();
    expect(runtime.revokePermission).not.toHaveBeenCalled();
  });

  it("sanitizes runtime lifecycle failures", async () => {
    const rawErrorMessage = "pause failed with raw-token at C:\\Users\\Nur\\secret";
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.pause).mockImplementation(() => {
      throw new Error(rawErrorMessage);
    });
    const handle = await startSurface(runtime);

    const response = await postJson(handle, { command: "pause" });
    const body = await response.text();

    expect(response.status).toBe(409);
    expect(body).toContain(`"messageBytes":${Buffer.byteLength(rawErrorMessage)}`);
    expect(body).not.toContain(rawErrorMessage);
    expect(body).not.toContain("raw-token");
    expect(body).not.toContain("C:\\Users\\Nur");
  });

  it("stops the listener after accepted terminate or disconnect", async () => {
    const terminateRuntime = createRuntimeSpy();
    const terminateHandle = await startSurface(terminateRuntime);

    const terminate = await postJson(terminateHandle, { command: "terminate" });
    expect(terminate.status).toBe(202);
    expect(terminateRuntime.terminate).toHaveBeenCalledTimes(1);
    await waitForStopped(terminateHandle);
    removeHandle(terminateHandle);

    const disconnectRuntime = createRuntimeSpy();
    const disconnectHandle = await startSurface(disconnectRuntime);

    const disconnect = await postJson(disconnectHandle, { command: "disconnect" });
    expect(disconnect.status).toBe(202);
    expect(disconnectRuntime.disconnect).toHaveBeenCalledTimes(1);
    await waitForStopped(disconnectHandle);
    removeHandle(disconnectHandle);
  });
});

function createRuntimeSpy(): HostLocalControlSurfaceRuntime {
  return {
    getHostStatus: vi.fn(() => ({
      state: "inactive",
      visibleToHost: false,
      permissionCount: 0
    })),
    disconnect: vi.fn(),
    pause: vi.fn(),
    revokePermission: vi.fn(),
    resume: vi.fn(),
    terminate: vi.fn()
  };
}

async function startSurface(
  runtime: HostLocalControlSurfaceRuntime
): Promise<HostLocalControlSurfaceHandle> {
  const handle = await startHostLocalControlSurface(runtime, { port: 0 });
  handles.push(handle);
  return handle;
}

function postJson(
  handle: HostLocalControlSurfaceHandle,
  body: unknown
): Promise<Response> {
  return fetch(`${handle.url}control`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: originForHandle(handle),
      "x-winbridge-local-surface-token": handle.token
    },
    body: JSON.stringify(body)
  });
}

function rawSurfaceRequest(
  handle: HostLocalControlSurfaceHandle,
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

function originForHandle(handle: HostLocalControlSurfaceHandle): string {
  return handle.url.replace(/\/$/, "");
}

async function waitForStopped(handle: HostLocalControlSurfaceHandle): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch(`${handle.url}status`);
    } catch {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  throw new Error("Timed out waiting for host local control surface to stop");
}

function removeHandle(handle: HostLocalControlSurfaceHandle): void {
  const index = handles.indexOf(handle);
  if (index !== -1) {
    handles.splice(index, 1);
  }
}
