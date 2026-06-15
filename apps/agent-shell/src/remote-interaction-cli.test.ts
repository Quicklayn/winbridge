import { Writable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import type { AgentShellDevInputEventArgs, AgentShellDevScreenFrameArgs } from "./args.js";
import {
  scheduleDevelopmentInputEventSend,
  scheduleDevelopmentScreenFrameSend
} from "./remote-interaction-cli.js";
import type { AgentShellRuntime } from "./runtime.js";

const frameArgs: AgentShellDevScreenFrameArgs = {
  afterMs: 10,
  frame: {
    frameId: "frame_cli_1",
    sequence: 0,
    format: "image/png",
    width: 1,
    height: 1,
    dataBase64: "eA=="
  }
};

const inputArgs: AgentShellDevInputEventArgs = {
  afterMs: 0,
  input: {
    eventId: "input_cli_1",
    sequence: 0,
    event: {
      kind: "pointer-move",
      x: 0.5,
      y: 0.5,
      buttons: 0
    }
  }
};

describe("development remote interaction CLI scheduler", () => {
  it("rejects malformed direct scheduler delays before status reads or sends", () => {
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

      expect(() =>
        scheduleDevelopmentScreenFrameSend(
          runtime,
          {
            ...frameArgs,
            afterMs: delayMs
          },
          { output }
        )
      ).toThrow("Agent shell scheduler delay must be a bounded integer");
      expect(runtime.getHostStatus).not.toHaveBeenCalled();
      expect(runtime.sendScreenFrame).not.toHaveBeenCalled();
      expect(runtime.sendInputEvent).not.toHaveBeenCalled();
      expect(runtime.send).not.toHaveBeenCalled();
      expect(output.text()).toBe("");
    }
  });

  it("waits for active visible host authorization and sends one screen frame", async () => {
    vi.useFakeTimers();
    try {
      const runtime = createRuntimeSpy();
      const output = createCapturingOutput();

      const handle = scheduleDevelopmentScreenFrameSend(runtime, frameArgs, {
        output,
        pollIntervalMs: 5
      });

      await vi.advanceTimersByTimeAsync(9);
      expect(runtime.getHostStatus).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(runtime.getHostStatus).toHaveBeenCalledTimes(1);
      expect(runtime.sendScreenFrame).not.toHaveBeenCalled();

      vi.mocked(runtime.getHostStatus).mockReturnValue({
        state: "active",
        visibleToHost: true,
        authorizationStatus: "active",
        authorizationId: "authz_cli_scheduler_1",
        permissionCount: 1
      });
      await vi.advanceTimersByTimeAsync(5);

      expect(runtime.sendScreenFrame).toHaveBeenCalledTimes(1);
      expect(runtime.sendScreenFrame).toHaveBeenCalledWith({
        authorizationId: "authz_cli_scheduler_1",
        ...frameArgs.frame
      });
      expect(runtime.sendInputEvent).not.toHaveBeenCalled();
      expect(runtime.send).not.toHaveBeenCalled();
      expect(output.text()).toBe("");

      await vi.advanceTimersByTimeAsync(25);
      expect(runtime.sendScreenFrame).toHaveBeenCalledTimes(1);

      handle.stop();
    } finally {
      vi.useRealTimers();
    }
  });

  it("waits for active visible viewer authorization and sends one input event", async () => {
    vi.useFakeTimers();
    try {
      const runtime = createRuntimeSpy();
      vi.mocked(runtime.getViewerStatus).mockReturnValue({
        state: "active",
        visibleToHost: true,
        authorizationStatus: "active",
        authorizationId: "authz_cli_scheduler_2",
        permissionCount: 1
      });
      const output = createCapturingOutput();

      scheduleDevelopmentInputEventSend(runtime, inputArgs, { output, pollIntervalMs: 5 });
      await vi.advanceTimersByTimeAsync(0);

      expect(runtime.sendInputEvent).toHaveBeenCalledTimes(1);
      expect(runtime.sendInputEvent).toHaveBeenCalledWith({
        authorizationId: "authz_cli_scheduler_2",
        ...inputArgs.input
      });
      expect(runtime.sendScreenFrame).not.toHaveBeenCalled();
      expect(runtime.send).not.toHaveBeenCalled();
      expect(output.text()).toBe("");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not send while authorization is missing, paused, revoked, or expired", async () => {
    vi.useFakeTimers();
    try {
      const blockedStatuses = [
        {
          state: "inactive",
          visibleToHost: false,
          permissionCount: 0
        },
        {
          state: "paused",
          visibleToHost: true,
          authorizationStatus: "paused",
          authorizationId: "authz_cli_scheduler_paused",
          permissionCount: 1
        },
        {
          state: "inactive",
          visibleToHost: false,
          authorizationStatus: "revoked",
          authorizationId: "authz_cli_scheduler_revoked",
          permissionCount: 0
        },
        {
          state: "inactive",
          visibleToHost: false,
          authorizationStatus: "expired",
          authorizationId: "authz_cli_scheduler_expired",
          permissionCount: 0
        }
      ] as const;

      for (const status of blockedStatuses) {
        const runtime = createRuntimeSpy();
        vi.mocked(runtime.getHostStatus).mockReturnValue(status);
        const output = createCapturingOutput();

        const handle = scheduleDevelopmentScreenFrameSend(runtime, { ...frameArgs, afterMs: 0 }, {
          output,
          pollIntervalMs: 5
        });
        await vi.advanceTimersByTimeAsync(20);
        handle.stop();

        expect(runtime.getHostStatus).toHaveBeenCalled();
        expect(runtime.sendScreenFrame).not.toHaveBeenCalled();
        expect(runtime.sendInputEvent).not.toHaveBeenCalled();
        expect(runtime.send).not.toHaveBeenCalled();
        expect(output.text()).toBe("");
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it("stops before status reads or sends", async () => {
    vi.useFakeTimers();
    try {
      const runtime = createRuntimeSpy();
      const output = createCapturingOutput();

      const handle = scheduleDevelopmentScreenFrameSend(runtime, frameArgs, {
        output,
        pollIntervalMs: 5
      });
      handle.stop();
      await vi.advanceTimersByTimeAsync(20);

      expect(runtime.getHostStatus).not.toHaveBeenCalled();
      expect(runtime.sendScreenFrame).not.toHaveBeenCalled();
      expect(output.text()).toBe("");
    } finally {
      vi.useRealTimers();
    }
  });

  it("formats runtime and audit failures without raw exception text", async () => {
    vi.useFakeTimers();
    try {
      const rawErrorMessage = "audit failed with raw-screen-content at C:\\Users\\Nur\\secret";
      const runtime = createRuntimeSpy();
      vi.mocked(runtime.getHostStatus).mockReturnValue({
        state: "active",
        visibleToHost: true,
        authorizationStatus: "active",
        authorizationId: "authz_cli_scheduler_3",
        permissionCount: 1
      });
      vi.mocked(runtime.sendScreenFrame).mockImplementation(() => {
        throw new Error(rawErrorMessage);
      });
      const output = createCapturingOutput();

      scheduleDevelopmentScreenFrameSend(runtime, { ...frameArgs, afterMs: 0 }, { output });
      await vi.advanceTimersByTimeAsync(0);

      expect(output.text()).toContain(
        `[winbridge-agent] error messageBytes=${Buffer.byteLength(rawErrorMessage)}`
      );
      expect(output.text()).not.toContain(rawErrorMessage);
      expect(output.text()).not.toContain("raw-screen-content");
      expect(output.text()).not.toContain("C:\\Users\\Nur");

      await vi.advanceTimersByTimeAsync(50);
      expect(runtime.sendScreenFrame).toHaveBeenCalledTimes(1);
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
