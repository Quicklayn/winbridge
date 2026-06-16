import { Writable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { scheduleHostStatusPrint } from "./host-status.js";
import type { AgentShellRuntime } from "./runtime.js";

describe("host status print", () => {
  it("rejects malformed direct scheduler delays before status reads or output", () => {
    const malformedDelays = [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      2_147_483_648
    ];

    for (const delayMs of malformedDelays) {
      const runtime = createRuntimeSpy();
      const output = createCapturingOutput();

      expect(() => scheduleHostStatusPrint(runtime, delayMs, { output })).toThrow(
        "Agent shell scheduler delay must be a bounded integer"
      );
      expect(runtime.getHostStatus).not.toHaveBeenCalled();
      expect(runtime.getViewerStatus).not.toHaveBeenCalled();
      expect(runtime.leave).not.toHaveBeenCalled();
      expect(runtime.stop).not.toHaveBeenCalled();
      expect(runtime.pause).not.toHaveBeenCalled();
      expect(runtime.resume).not.toHaveBeenCalled();
      expect(runtime.revokePermission).not.toHaveBeenCalled();
      expect(runtime.terminate).not.toHaveBeenCalled();
      expect(runtime.disconnect).not.toHaveBeenCalled();
      expect(runtime.send).not.toHaveBeenCalled();
      expect(output.text()).toBe("");
    }
  });

  it("prints host status after the configured delay without invoking controls or public sends", async () => {
    vi.useFakeTimers();
    try {
      const runtime = createRuntimeSpy();
      vi.mocked(runtime.getHostStatus).mockReturnValue({
        state: "active",
        authorizationStatus: "active",
        authorizationId: "authz_host_status_1",
        expiresAt: "2026-06-14T12:00:00.000Z",
        viewerDeviceId: "dev_viewer_1",
        viewerDevicePlatform: "windows",
        visibleToHost: true,
        permissionCount: 1
      });
      const output = createCapturingOutput();

      const handle = scheduleHostStatusPrint(runtime, 25, { output });

      await vi.advanceTimersByTimeAsync(24);
      expect(output.text()).toBe("");

      await vi.advanceTimersByTimeAsync(1);
      expect(runtime.getHostStatus).toHaveBeenCalledTimes(1);
      expect(runtime.getViewerStatus).not.toHaveBeenCalled();
      expect(runtime.leave).not.toHaveBeenCalled();
      expect(runtime.stop).not.toHaveBeenCalled();
      expect(runtime.pause).not.toHaveBeenCalled();
      expect(runtime.resume).not.toHaveBeenCalled();
      expect(runtime.revokePermission).not.toHaveBeenCalled();
      expect(runtime.terminate).not.toHaveBeenCalled();
      expect(runtime.disconnect).not.toHaveBeenCalled();
      expect(runtime.send).not.toHaveBeenCalled();
      expect(output.text()).toContain("[winbridge-agent] host status");
      expect(output.text()).toContain("state=active");
      expect(output.text()).toContain("visibleToHost=true");
      expect(output.text()).toContain("permissionCount=1");
      expect(output.text()).toContain("authorizationStatus=active");
      expect(output.text()).toContain("authorizationId=authz_host_status_1");
      expect(output.text()).toContain("expiresAt=2026-06-14T12:00:00.000Z");
      expect(output.text()).toContain("viewerDeviceId=dev_viewer_1");
      expect(output.text()).toContain("viewerDevicePlatform=windows");
      expect(output.text()).not.toContain("verified");
      expect(output.text()).not.toContain("screen:view");
      expect(output.text()).not.toContain("Viewer Support");
      expect(output.text()).not.toContain("raw-token");

      handle.stop();
    } finally {
      vi.useRealTimers();
    }
  });

  it("prints inactive host status with bounded inactive cause metadata", async () => {
    vi.useFakeTimers();
    try {
      const runtime = createRuntimeSpy();
      vi.mocked(runtime.getHostStatus).mockReturnValue({
        state: "inactive",
        authorizationStatus: "active",
        authorizationId: "authz_host_status_1",
        visibleToHost: false,
        permissionCount: 0,
        inactiveCause: "peer-disconnected",
        remoteDisconnectReasonCode: "peer-closed"
      });
      const output = createCapturingOutput();

      scheduleHostStatusPrint(runtime, 0, { output });
      await vi.advanceTimersByTimeAsync(0);

      expect(runtime.getHostStatus).toHaveBeenCalledTimes(1);
      expect(output.text()).toContain("state=inactive");
      expect(output.text()).toContain("visibleToHost=false");
      expect(output.text()).toContain("permissionCount=0");
      expect(output.text()).toContain("inactiveCause=peer-disconnected");
      expect(output.text()).toContain("remoteDisconnectReasonCode=peer-closed");
      expect(output.text()).not.toContain("viewer-1");
      expect(output.text()).not.toContain("Host closed session");
      expect(output.text()).not.toContain("raw-token");
    } finally {
      vi.useRealTimers();
    }
  });

  it("stops before printing status", async () => {
    vi.useFakeTimers();
    try {
      const runtime = createRuntimeSpy();
      const output = createCapturingOutput();

      const handle = scheduleHostStatusPrint(runtime, 10, { output });
      handle.stop();
      await vi.advanceTimersByTimeAsync(10);

      expect(runtime.getHostStatus).not.toHaveBeenCalled();
      expect(output.text()).toBe("");
    } finally {
      vi.useRealTimers();
    }
  });

  it("formats runtime failures without raw exception text", async () => {
    vi.useFakeTimers();
    try {
      const rawErrorMessage = "host status failed with raw-token at C:\\Users\\Nur\\secret";
      const runtime = createRuntimeSpy();
      vi.mocked(runtime.getHostStatus).mockImplementation(() => {
        throw new Error(rawErrorMessage);
      });
      const output = createCapturingOutput();

      scheduleHostStatusPrint(runtime, 0, { output });
      await vi.advanceTimersByTimeAsync(0);

      expect(output.text()).toContain(
        `[winbridge-agent] error messageBytes=${Buffer.byteLength(rawErrorMessage)}`
      );
      expect(output.text()).not.toContain(rawErrorMessage);
      expect(output.text()).not.toContain("raw-token");
      expect(output.text()).not.toContain("C:\\Users\\Nur");
    } finally {
      vi.useRealTimers();
    }
  });
});

function createRuntimeSpy(): AgentShellRuntime {
  return {
    start: vi.fn(),
    stop: vi.fn(),
    leave: vi.fn(),
    getHostStatus: vi.fn(() => ({
      state: "inactive",
      visibleToHost: false,
      permissionCount: 0
    })),
    getViewerStatus: vi.fn(() => ({
      state: "inactive",
      visibleToHost: false,
      permissionCount: 0
    })),
    disconnect: vi.fn(),
    pause: vi.fn(),
    revokePermission: vi.fn(),
    resume: vi.fn(),
    terminate: vi.fn(),
    captureAndSendScreenFrame: vi.fn(),
    sendScreenFrame: vi.fn(),
    sendInputEvent: vi.fn(),
    send: vi.fn()
  };
}

function createCapturingOutput(): Writable & { text(): string } {
  const chunks: Buffer[] = [];
  const output = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    }
  }) as Writable & { text(): string };

  output.text = () => Buffer.concat(chunks).toString("utf8");

  return output;
}
