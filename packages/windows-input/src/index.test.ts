import { describe, expect, it, vi } from "vitest";
import {
  WINDOWS_INPUT_EVENT_ERROR_MESSAGE,
  WINDOWS_INPUT_GRANT_ERROR_MESSAGE,
  WINDOWS_INPUT_OUTPUT_ERROR_MESSAGE,
  WINDOWS_INPUT_PLATFORM_ERROR_MESSAGE,
  WINDOWS_INPUT_RUNNER_ERROR_MESSAGE,
  applyWindowsInputEvent,
  createPowerShellWindowsInputCommand,
  createWindowsInputAdapter,
  type WindowsInputEvent,
  type WindowsInputGrant,
  type WindowsInputNativeRunner,
  type WindowsInputNativeWorker,
  type WindowsInputNativeWorkerFactory
} from "./index.js";

const now = new Date("2026-06-16T05:00:00.000Z");
const validPointerGrant: WindowsInputGrant = {
  authorizationId: "authz_input_123",
  authorizationStatus: "active",
  visibleToHost: true,
  permissions: ["input:pointer"],
  peerConnected: true,
  expiresAt: "2026-06-16T05:10:00.000Z"
};
const validKeyboardGrant: WindowsInputGrant = {
  ...validPointerGrant,
  permissions: ["input:keyboard"]
};
const nativeSuccess = "{\"applied\":true}";

const pointerMoveInput: WindowsInputEvent = {
  authorizationId: "authz_input_123",
  eventId: "input_pointer_1",
  sequence: 1,
  occurredAt: "2026-06-16T05:00:01.000Z",
  event: {
    kind: "pointer-move",
    x: 0.5,
    y: 0.25,
    buttons: 1
  }
};

const keyboardInput: WindowsInputEvent = {
  authorizationId: "authz_input_123",
  eventId: "input_keyboard_1",
  sequence: 2,
  occurredAt: "2026-06-16T05:00:02.000Z",
  event: {
    kind: "key-down",
    key: "KeyA",
    code: "KeyA",
    modifiers: ["control", "shift"]
  }
};

describe("windows input adapter", () => {
  it("applies a bounded pointer event when the visible grant is active", async () => {
    const runner = vi.fn<WindowsInputNativeRunner>().mockResolvedValue(nativeSuccess);
    const result = await applyWindowsInputEvent(validPointerGrant, pointerMoveInput, {
      runner,
      platform: "win32",
      now: () => now
    });

    expect(runner).toHaveBeenCalledTimes(1);
    expect(runner).toHaveBeenCalledWith({
      timeoutMs: 5000,
      event: {
        kind: "pointer-move",
        x: 0.5,
        y: 0.25,
        xAbsolute: 32768,
        yAbsolute: 16384,
        buttons: 1
      }
    });
    expect(result).toEqual({
      authorizationId: "authz_input_123",
      eventId: "input_pointer_1",
      inputKind: "pointer-move",
      appliedAt: "2026-06-16T05:00:00.000Z"
    });
  });

  it("applies a bounded keyboard event when the visible grant is active", async () => {
    const runner = vi.fn<WindowsInputNativeRunner>().mockResolvedValue(nativeSuccess);
    const result = await applyWindowsInputEvent(validKeyboardGrant, keyboardInput, {
      runner,
      platform: "win32",
      now: () => now
    });

    expect(runner).toHaveBeenCalledTimes(1);
    expect(runner).toHaveBeenCalledWith({
      timeoutMs: 5000,
      event: {
        kind: "key-down",
        key: "KeyA",
        code: "KeyA",
        virtualKey: 0x41,
        modifiers: [
          { modifier: "control", virtualKey: 0x11 },
          { modifier: "shift", virtualKey: 0x10 }
        ]
      }
    });
    expect(result).toEqual({
      authorizationId: "authz_input_123",
      eventId: "input_keyboard_1",
      inputKind: "key-down",
      appliedAt: "2026-06-16T05:00:00.000Z"
    });
  });

  it("normalizes pointer buttons and wheel deltas without invoking raw commands", async () => {
    const runner = vi.fn<WindowsInputNativeRunner>().mockResolvedValue(nativeSuccess);
    const adapter = createWindowsInputAdapter({
      runner,
      platform: "win32",
      now: () => now
    });

    await adapter.applyInputEvent(validPointerGrant, {
      ...pointerMoveInput,
      eventId: "input_pointer_down_1",
      event: {
        kind: "pointer-down",
        x: 1,
        y: 0,
        button: "secondary"
      }
    });
    await adapter.applyInputEvent(validPointerGrant, {
      ...pointerMoveInput,
      eventId: "input_pointer_wheel_1",
      event: {
        kind: "pointer-wheel",
        x: 0,
        y: 1,
        deltaX: 0,
        deltaY: -2
      }
    });

    expect(runner).toHaveBeenNthCalledWith(1, {
      timeoutMs: 5000,
      event: {
        kind: "pointer-down",
        x: 1,
        y: 0,
        xAbsolute: 65535,
        yAbsolute: 0,
        button: "secondary"
      }
    });
    expect(runner).toHaveBeenNthCalledWith(2, {
      timeoutMs: 5000,
      event: {
        kind: "pointer-wheel",
        x: 0,
        y: 1,
        xAbsolute: 0,
        yAbsolute: 65535,
        deltaX: 0,
        deltaY: -240
      }
    });
  });

  it("does not invoke native input when the platform is not Windows", async () => {
    const runner = vi.fn<WindowsInputNativeRunner>().mockResolvedValue(nativeSuccess);
    await expect(
      applyWindowsInputEvent(validPointerGrant, pointerMoveInput, {
        runner,
        platform: "linux",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_INPUT_PLATFORM_ERROR_MESSAGE);

    expect(runner).not.toHaveBeenCalled();
  });

  it("does not invoke native input for inactive or unsafe grants", async () => {
    const cases: ReadonlyArray<Partial<WindowsInputGrant>> = [
      { authorizationId: "bad" },
      { authorizationId: "authz_other_123" },
      { authorizationStatus: "paused" as WindowsInputGrant["authorizationStatus"] },
      { visibleToHost: false },
      { permissions: [] },
      { permissions: ["screen:view"] },
      { peerConnected: false },
      { expiresAt: "2026-06-16T05:00:00.000Z" },
      { expiresAt: "not-a-date" }
    ];

    for (const override of cases) {
      const runner = vi.fn<WindowsInputNativeRunner>().mockResolvedValue(nativeSuccess);
      await expect(
        applyWindowsInputEvent(
          {
            ...validPointerGrant,
            ...override
          },
          pointerMoveInput,
          {
            runner,
            platform: "win32",
            now: () => now
          }
        )
      ).rejects.toThrow(WINDOWS_INPUT_GRANT_ERROR_MESSAGE);
      expect(runner).not.toHaveBeenCalled();
    }
  });

  it("does not invoke native input when the grant lacks the required input permission", async () => {
    const runner = vi.fn<WindowsInputNativeRunner>().mockResolvedValue(nativeSuccess);

    await expect(
      applyWindowsInputEvent(validPointerGrant, keyboardInput, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_INPUT_GRANT_ERROR_MESSAGE);
    expect(runner).not.toHaveBeenCalled();
  });

  it("does not run native input at adapter construction", () => {
    const runner = vi.fn<WindowsInputNativeRunner>().mockResolvedValue(nativeSuccess);
    createWindowsInputAdapter({
      runner,
      platform: "win32",
      now: () => now
    });

    expect(runner).not.toHaveBeenCalled();
  });

  it("lazily reuses one worker and serializes concurrent events", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const run = vi
      .fn<WindowsInputNativeWorker["run"]>()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const close = vi.fn();
    const workerFactory = vi.fn<WindowsInputNativeWorkerFactory>(() => ({ run, close }));
    const adapter = createWindowsInputAdapter({
      workerFactory,
      platform: "win32",
      now: () => now
    });

    expect(workerFactory).not.toHaveBeenCalled();
    const pointer = adapter.applyInputEvent(validPointerGrant, pointerMoveInput);
    const keyboard = adapter.applyInputEvent(validKeyboardGrant, keyboardInput);
    await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(1));
    expect(workerFactory).toHaveBeenCalledTimes(1);

    first.resolve(nativeSuccess);
    await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(2));
    second.resolve(nativeSuccess);

    await expect(pointer).resolves.toMatchObject({ eventId: "input_pointer_1" });
    await expect(keyboard).resolves.toMatchObject({ eventId: "input_keyboard_1" });
    expect(workerFactory).toHaveBeenCalledTimes(1);
    adapter.close();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("rejects a queued event whose grant expires before dispatch", async () => {
    let currentNow = now;
    const first = deferred<string>();
    const run = vi
      .fn<WindowsInputNativeWorker["run"]>()
      .mockImplementationOnce(() => first.promise);
    const adapter = createWindowsInputAdapter({
      workerFactory: () => ({ run, close: vi.fn() }),
      platform: "win32",
      now: () => currentNow
    });
    const longGrant = {
      ...validPointerGrant,
      expiresAt: "2026-06-16T05:20:00.000Z"
    };
    const shortGrant = {
      ...validPointerGrant,
      expiresAt: "2026-06-16T05:00:05.000Z"
    };

    const activeResult = adapter.applyInputEvent(longGrant, pointerMoveInput);
    const expiredResult = adapter.applyInputEvent(shortGrant, {
      ...pointerMoveInput,
      eventId: "input_pointer_expired_in_queue",
      sequence: 2
    });
    await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(1));
    currentNow = new Date("2026-06-16T05:00:06.000Z");
    first.resolve(nativeSuccess);

    await expect(activeResult).resolves.toMatchObject({ eventId: "input_pointer_1" });
    await expect(expiredResult).rejects.toThrow(WINDOWS_INPUT_GRANT_ERROR_MESSAGE);
    expect(run).toHaveBeenCalledTimes(1);
    adapter.close();
  });

  it("bounds queued native input before accepting more work", async () => {
    const activeNative = deferred<string>();
    const run = vi.fn<WindowsInputNativeWorker["run"]>(() => activeNative.promise);
    const adapter = createWindowsInputAdapter({
      workerFactory: () => ({
        run,
        close: () => activeNative.reject(new Error("closed"))
      }),
      platform: "win32",
      now: () => now,
      maxQueueSize: 1
    });

    const activeResult = adapter.applyInputEvent(validPointerGrant, pointerMoveInput);
    await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(1));
    await expect(
      adapter.applyInputEvent(validPointerGrant, {
        ...pointerMoveInput,
        eventId: "input_pointer_queue_overflow",
        sequence: 2
      })
    ).rejects.toThrow(WINDOWS_INPUT_RUNNER_ERROR_MESSAGE);
    expect(run).toHaveBeenCalledTimes(1);
    adapter.close();
    await expect(activeResult).rejects.toThrow(WINDOWS_INPUT_RUNNER_ERROR_MESSAGE);
  });

  it("close rejects active and queued work before later native dispatch", async () => {
    const activeNative = deferred<string>();
    const run = vi.fn<WindowsInputNativeWorker["run"]>(() => activeNative.promise);
    const close = vi.fn(() => activeNative.reject(new Error("raw native close failure KeyZ")));
    const adapter = createWindowsInputAdapter({
      workerFactory: () => ({ run, close }),
      platform: "win32",
      now: () => now
    });

    const activeResult = adapter.applyInputEvent(validPointerGrant, pointerMoveInput);
    const queuedResult = adapter.applyInputEvent(validPointerGrant, {
      ...pointerMoveInput,
      eventId: "input_pointer_queued_close",
      sequence: 2
    });
    await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(1));
    adapter.close();
    adapter.close();

    await expect(activeResult).rejects.toThrow(WINDOWS_INPUT_RUNNER_ERROR_MESSAGE);
    await expect(queuedResult).rejects.toThrow(WINDOWS_INPUT_RUNNER_ERROR_MESSAGE);
    expect(run).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(await Promise.allSettled([activeResult, queuedResult]))).not.toContain(
      "raw native close failure KeyZ"
    );
  });

  it("starts a fresh worker only for a later valid generation", async () => {
    const firstNative = deferred<string>();
    const firstRun = vi.fn<WindowsInputNativeWorker["run"]>(() => firstNative.promise);
    const firstClose = vi.fn(() => firstNative.reject(new Error("closed")));
    const secondRun = vi.fn<WindowsInputNativeWorker["run"]>().mockResolvedValue(nativeSuccess);
    const secondClose = vi.fn();
    const workerFactory = vi
      .fn<WindowsInputNativeWorkerFactory>()
      .mockReturnValueOnce({ run: firstRun, close: firstClose })
      .mockReturnValueOnce({ run: secondRun, close: secondClose });
    const adapter = createWindowsInputAdapter({ workerFactory, platform: "win32", now: () => now });

    const stale = adapter.applyInputEvent(validPointerGrant, pointerMoveInput);
    await vi.waitFor(() => expect(firstRun).toHaveBeenCalledTimes(1));
    adapter.close();
    await expect(stale).rejects.toThrow(WINDOWS_INPUT_RUNNER_ERROR_MESSAGE);

    await expect(
      adapter.applyInputEvent(validPointerGrant, {
        ...pointerMoveInput,
        eventId: "input_pointer_new_generation",
        sequence: 2
      })
    ).resolves.toMatchObject({ eventId: "input_pointer_new_generation" });
    expect(workerFactory).toHaveBeenCalledTimes(2);
    expect(secondRun).toHaveBeenCalledTimes(1);
    adapter.close();
    expect(secondClose).toHaveBeenCalledTimes(1);
  });

  it("discards a failed worker and keeps diagnostics generic", async () => {
    const rawFailure = "worker failed with KeyA control raw-token";
    const firstRun = vi.fn<WindowsInputNativeWorker["run"]>().mockRejectedValue(new Error(rawFailure));
    const firstClose = vi.fn();
    const secondRun = vi.fn<WindowsInputNativeWorker["run"]>().mockResolvedValue(nativeSuccess);
    const secondClose = vi.fn();
    const workerFactory = vi
      .fn<WindowsInputNativeWorkerFactory>()
      .mockReturnValueOnce({ run: firstRun, close: firstClose })
      .mockReturnValueOnce({ run: secondRun, close: secondClose });
    const adapter = createWindowsInputAdapter({ workerFactory, platform: "win32", now: () => now });

    const failure = await adapter.applyInputEvent(validKeyboardGrant, keyboardInput).catch((error) => error);
    expect(failure).toEqual(new Error(WINDOWS_INPUT_RUNNER_ERROR_MESSAGE));
    expect(String(failure)).not.toContain(rawFailure);
    expect(firstClose).toHaveBeenCalled();

    await expect(adapter.applyInputEvent(validKeyboardGrant, keyboardInput)).resolves.toMatchObject({
      eventId: "input_keyboard_1"
    });
    expect(workerFactory).toHaveBeenCalledTimes(2);
    adapter.close();
  });

  it("closes the reusable worker after the one-shot convenience operation", async () => {
    const run = vi.fn<WindowsInputNativeWorker["run"]>().mockResolvedValue(nativeSuccess);
    const close = vi.fn();

    await expect(
      applyWindowsInputEvent(validPointerGrant, pointerMoveInput, {
        workerFactory: () => ({ run, close }),
        platform: "win32",
        now: () => now
      })
    ).resolves.toMatchObject({ eventId: "input_pointer_1" });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("rejects ambiguous runner and worker configuration before native work", () => {
    const runner = vi.fn<WindowsInputNativeRunner>();
    const workerFactory = vi.fn<WindowsInputNativeWorkerFactory>();

    expect(() => createWindowsInputAdapter({ runner, workerFactory })).toThrow(
      WINDOWS_INPUT_OUTPUT_ERROR_MESSAGE
    );
    expect(runner).not.toHaveBeenCalled();
    expect(workerFactory).not.toHaveBeenCalled();
  });

  it("rejects malformed input before native invocation", async () => {
    const runner = vi.fn<WindowsInputNativeRunner>().mockResolvedValue(nativeSuccess);
    const rawKeyBuffer = "raw-keylogging-buffer-secret";

    await expect(
      applyWindowsInputEvent(
        validKeyboardGrant,
        {
          ...keyboardInput,
          event: {
            kind: "key-down",
            key: rawKeyBuffer,
            modifiers: ["control", "control"]
          }
        } as unknown as WindowsInputEvent,
        {
          runner,
          platform: "win32",
          now: () => now
        }
      )
    ).rejects.toThrow(WINDOWS_INPUT_EVENT_ERROR_MESSAGE);
    await expect(
      applyWindowsInputEvent(
        validKeyboardGrant,
        {
          ...keyboardInput,
          event: {
            kind: "key-down",
            key: rawKeyBuffer,
            modifiers: ["control", "control"]
          }
        } as unknown as WindowsInputEvent,
        {
          runner,
          platform: "win32",
          now: () => now
        }
      )
    ).rejects.not.toThrow(/raw-keylogging-buffer-secret/);
    expect(runner).not.toHaveBeenCalled();
  });

  it("rejects native output failures without exposing output", async () => {
    const runner = vi
      .fn<WindowsInputNativeRunner>()
      .mockResolvedValue("{\"applied\":false,\"raw\":\"KeyA raw-token\"}");

    await expect(
      applyWindowsInputEvent(validKeyboardGrant, keyboardInput, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_INPUT_OUTPUT_ERROR_MESSAGE);
    await expect(
      applyWindowsInputEvent(validKeyboardGrant, keyboardInput, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.not.toThrow(/KeyA|raw-token/);
  });

  it("rejects runner failures without exposing command output", async () => {
    const runner = vi
      .fn<WindowsInputNativeRunner>()
      .mockRejectedValue(new Error("raw-key-data pairing-code=123-456"));

    await expect(
      applyWindowsInputEvent(validKeyboardGrant, keyboardInput, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_INPUT_RUNNER_ERROR_MESSAGE);
    await expect(
      applyWindowsInputEvent(validKeyboardGrant, keyboardInput, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.not.toThrow(/raw-key-data|123-456/);
  });

  it("rejects unsafe adapter bounds before native input", async () => {
    const runner = vi.fn<WindowsInputNativeRunner>().mockResolvedValue(nativeSuccess);

    await expect(
      applyWindowsInputEvent(validKeyboardGrant, keyboardInput, {
        runner,
        platform: "win32",
        now: () => now,
        timeoutMs: 0
      })
    ).rejects.toThrow(WINDOWS_INPUT_OUTPUT_ERROR_MESSAGE);
    expect(runner).not.toHaveBeenCalled();
  });

  it("uses a fixed non-interactive PowerShell command", () => {
    const command = createPowerShellWindowsInputCommand({
      timeoutMs: 5000,
      event: {
        kind: "key-up",
        key: "KeyA",
        code: "KeyA",
        virtualKey: 0x41,
        modifiers: []
      }
    });

    expect(command.slice(0, 3)).toEqual(["-NoProfile", "-NonInteractive", "-Command"]);
    expect(command.join(" ")).not.toMatch(/ExecutionPolicy|Bypass|Invoke-Expression/);
    expect(command.join(" ")).not.toContain("[uint32][int]$event.delta");
    expect(command.join(" ")).toContain("Convert-ToDword");
  });
});

function deferred<T>(): {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: Error): void;
} {
  let resolvePromise!: (value: T) => void;
  let rejectPromise!: (error: Error) => void;
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return {
    promise,
    resolve: resolvePromise,
    reject: rejectPromise
  };
}
