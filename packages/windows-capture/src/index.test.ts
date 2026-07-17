import { describe, expect, it, vi } from "vitest";
import {
  capturePrimaryScreen,
  createPowerShellPrimaryScreenCaptureCommand,
  createWindowsScreenCaptureAdapter,
  WINDOWS_SCREEN_CAPTURE_GRANT_ERROR_MESSAGE,
  WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE,
  WINDOWS_SCREEN_CAPTURE_PLATFORM_ERROR_MESSAGE,
  WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE,
  type WindowsScreenCaptureGrant,
  type WindowsScreenCaptureNativeWorker,
  type WindowsScreenCaptureNativeWorkerFactory,
  type WindowsScreenCaptureNativeRunner
} from "./index.js";

const now = new Date("2026-06-16T05:00:00.000Z");
const validGrant: WindowsScreenCaptureGrant = {
  authorizationId: "authz_screen_123",
  authorizationStatus: "active",
  visibleToHost: true,
  permissions: ["screen:view"],
  peerConnected: true,
  expiresAt: "2026-06-16T05:10:00.000Z"
};

const validNativeOutput = JSON.stringify({
  format: "jpeg",
  width: 2,
  height: 1,
  dataBase64: "/9j/4AAQSkZJRg=="
});
const validPngNativeOutput = JSON.stringify({
  format: "png",
  width: 2,
  height: 1,
  dataBase64: "iVBORw0KGgo="
});

describe("windows screen capture adapter", () => {
  it("captures a bounded JPEG frame when the visible grant is active", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);
    const frame = await capturePrimaryScreen(validGrant, {
      runner,
      platform: "win32",
      now: () => now
    });

    expect(runner).toHaveBeenCalledTimes(1);
    expect(runner).toHaveBeenCalledWith({
      timeoutMs: 5000,
      maxDataBase64Bytes: 49152,
      maxOutputBytes: 53248
    });
    expect(frame).toEqual({
      authorizationId: "authz_screen_123",
      capturedAt: "2026-06-16T05:00:00.000Z",
      format: "jpeg",
      width: 2,
      height: 1,
      dataBase64: "/9j/4AAQSkZJRg==",
      dataBase64Bytes: 16
    });
  });

  it("keeps bounded PNG native output compatible", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validPngNativeOutput);
    const frame = await capturePrimaryScreen(validGrant, {
      runner,
      platform: "win32",
      now: () => now
    });

    expect(frame).toMatchObject({
      format: "png",
      width: 2,
      height: 1,
      dataBase64: "iVBORw0KGgo="
    });
  });

  it("does not invoke native capture when the platform is not Windows", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);
    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "linux",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_PLATFORM_ERROR_MESSAGE);

    expect(runner).not.toHaveBeenCalled();
  });

  it("does not invoke native capture for inactive or unsafe grants", async () => {
    const cases: ReadonlyArray<Partial<WindowsScreenCaptureGrant>> = [
      { authorizationId: "bad" },
      { authorizationStatus: "paused" as WindowsScreenCaptureGrant["authorizationStatus"] },
      { visibleToHost: false },
      { permissions: [] },
      { permissions: ["input:pointer" as WindowsScreenCaptureGrant["permissions"][number]] },
      { peerConnected: false },
      { expiresAt: "2026-06-16T05:00:00.000Z" },
      { expiresAt: "not-a-date" }
    ];

    for (const override of cases) {
      const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);
      await expect(
        capturePrimaryScreen(
          {
            ...validGrant,
            ...override
          },
          {
            runner,
            platform: "win32",
            now: () => now
          }
        )
      ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_GRANT_ERROR_MESSAGE);
      expect(runner).not.toHaveBeenCalled();
    }
  });

  it("does not run native capture at adapter construction", () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);
    createWindowsScreenCaptureAdapter({
      runner,
      platform: "win32",
      now: () => now
    });

    expect(runner).not.toHaveBeenCalled();
  });

  it("does not create the reusable worker at adapter construction", () => {
    const workerFactory = vi.fn<WindowsScreenCaptureNativeWorkerFactory>(() =>
      createWorker(async () => validNativeOutput)
    );

    createWindowsScreenCaptureAdapter({
      workerFactory,
      platform: "win32",
      now: () => now
    });

    expect(workerFactory).not.toHaveBeenCalled();
  });

  it("lazily reuses one worker and serializes captures in FIFO order", async () => {
    const firstOutput = createDeferred<string>();
    const secondOutput = JSON.stringify({
      format: "jpeg",
      width: 3,
      height: 2,
      dataBase64: "/9j/4AAQSkZJRg=="
    });
    const worker = createWorker(
      vi
        .fn<WindowsScreenCaptureNativeWorker["run"]>()
        .mockReturnValueOnce(firstOutput.promise)
        .mockResolvedValueOnce(secondOutput)
    );
    const workerFactory = vi.fn<WindowsScreenCaptureNativeWorkerFactory>(() => worker);
    const adapter = createWindowsScreenCaptureAdapter({
      workerFactory,
      platform: "win32",
      now: () => now
    });

    const firstCapture = adapter.capturePrimaryScreen(validGrant);
    const secondCapture = adapter.capturePrimaryScreen(validGrant);

    expect(workerFactory).toHaveBeenCalledTimes(1);
    expect(worker.run).toHaveBeenCalledTimes(1);
    firstOutput.resolve(validNativeOutput);

    await expect(firstCapture).resolves.toMatchObject({ width: 2, height: 1 });
    await vi.waitFor(() => expect(worker.run).toHaveBeenCalledTimes(2));
    await expect(secondCapture).resolves.toMatchObject({ width: 3, height: 2 });
    expect(worker.run).toHaveBeenNthCalledWith(1, {
      timeoutMs: 5000,
      maxDataBase64Bytes: 49152,
      maxOutputBytes: 53248
    });
    expect(worker.run).toHaveBeenNthCalledWith(2, {
      timeoutMs: 5000,
      maxDataBase64Bytes: 49152,
      maxOutputBytes: 53248
    });
    adapter.close();
    expect(worker.close).toHaveBeenCalledTimes(1);
  });

  it("rejects a queued capture whose grant expires before dispatch", async () => {
    let currentNow = new Date("2026-06-16T05:00:00.000Z");
    const firstOutput = createDeferred<string>();
    const worker = createWorker(
      vi
        .fn<WindowsScreenCaptureNativeWorker["run"]>()
        .mockReturnValueOnce(firstOutput.promise)
        .mockResolvedValue(validNativeOutput)
    );
    const adapter = createWindowsScreenCaptureAdapter({
      workerFactory: () => worker,
      platform: "win32",
      now: () => currentNow
    });
    const firstGrant = {
      ...validGrant,
      expiresAt: "2026-06-16T05:20:00.000Z"
    };
    const queuedGrant = {
      ...validGrant,
      expiresAt: "2026-06-16T05:05:00.000Z"
    };

    const firstCapture = adapter.capturePrimaryScreen(firstGrant);
    const queuedCapture = adapter.capturePrimaryScreen(queuedGrant);
    currentNow = new Date("2026-06-16T05:06:00.000Z");
    firstOutput.resolve(validNativeOutput);

    await expect(firstCapture).resolves.toMatchObject({ authorizationId: validGrant.authorizationId });
    await expect(queuedCapture).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_GRANT_ERROR_MESSAGE);
    expect(worker.run).toHaveBeenCalledTimes(1);
    adapter.close();
  });

  it("revalidates grant expiry after native output", async () => {
    let currentNow = new Date("2026-06-16T05:00:00.000Z");
    const output = createDeferred<string>();
    const worker = createWorker(() => output.promise);
    const adapter = createWindowsScreenCaptureAdapter({
      workerFactory: () => worker,
      platform: "win32",
      now: () => currentNow
    });
    const capture = adapter.capturePrimaryScreen(validGrant);

    currentNow = new Date(validGrant.expiresAt);
    output.resolve(validNativeOutput);

    await expect(capture).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_GRANT_ERROR_MESSAGE);
    adapter.close();
  });

  it("bounds the combined active and queued capture count to two by default", async () => {
    const output = createDeferred<string>();
    const worker = createWorker(() => output.promise);
    const adapter = createWindowsScreenCaptureAdapter({
      workerFactory: () => worker,
      platform: "win32",
      now: () => now
    });
    const activeCapture = adapter.capturePrimaryScreen(validGrant);
    const queuedCapture = adapter.capturePrimaryScreen(validGrant);

    await expect(adapter.capturePrimaryScreen(validGrant)).rejects.toThrow(
      WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE
    );
    expect(worker.run).toHaveBeenCalledTimes(1);

    adapter.close();
    await expect(activeCapture).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
    await expect(queuedCapture).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
    output.resolve(validNativeOutput);
  });

  it("close synchronously rejects active and queued work and drops late output", async () => {
    const output = createDeferred<string>();
    const worker = createWorker(() => output.promise);
    const adapter = createWindowsScreenCaptureAdapter({
      workerFactory: () => worker,
      platform: "win32",
      now: () => now
    });
    const activeCapture = adapter.capturePrimaryScreen(validGrant);
    const queuedCapture = adapter.capturePrimaryScreen(validGrant);

    adapter.close();
    adapter.close();

    expect(worker.close).toHaveBeenCalledTimes(1);
    await expect(activeCapture).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
    await expect(queuedCapture).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
    output.resolve(validNativeOutput);
    await Promise.resolve();
    expect(worker.run).toHaveBeenCalledTimes(1);
  });

  it("starts a fresh worker only for a later valid generation", async () => {
    const firstOutput = createDeferred<string>();
    const firstWorker = createWorker(() => firstOutput.promise);
    const secondWorker = createWorker(async () => validNativeOutput);
    const workerFactory = vi
      .fn<WindowsScreenCaptureNativeWorkerFactory>()
      .mockReturnValueOnce(firstWorker)
      .mockReturnValueOnce(secondWorker);
    const adapter = createWindowsScreenCaptureAdapter({
      workerFactory,
      platform: "win32",
      now: () => now
    });
    const staleCapture = adapter.capturePrimaryScreen(validGrant);

    adapter.close();
    const freshCapture = adapter.capturePrimaryScreen(validGrant);

    await expect(staleCapture).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
    await expect(freshCapture).resolves.toMatchObject({ authorizationId: validGrant.authorizationId });
    expect(workerFactory).toHaveBeenCalledTimes(2);
    expect(firstWorker.close).toHaveBeenCalledTimes(1);
    expect(secondWorker.run).toHaveBeenCalledTimes(1);
    firstOutput.resolve(validNativeOutput);
    await Promise.resolve();
    adapter.close();
  });

  it("discards a failed worker and keeps diagnostics generic before restart", async () => {
    const rawDiagnostic = "raw-screen-content token=private C:\\Users\\secret";
    const firstWorker = createWorker(async () => {
      throw new Error(rawDiagnostic);
    });
    const secondWorker = createWorker(async () => validNativeOutput);
    const workerFactory = vi
      .fn<WindowsScreenCaptureNativeWorkerFactory>()
      .mockReturnValueOnce(firstWorker)
      .mockReturnValueOnce(secondWorker);
    const adapter = createWindowsScreenCaptureAdapter({
      workerFactory,
      platform: "win32",
      now: () => now
    });

    const failure = await adapter.capturePrimaryScreen(validGrant).catch((error) => error);
    expect(failure).toEqual(new Error(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE));
    expect(String(failure)).not.toContain(rawDiagnostic);
    expect(firstWorker.close).toHaveBeenCalledTimes(1);

    await expect(adapter.capturePrimaryScreen(validGrant)).resolves.toMatchObject({
      authorizationId: validGrant.authorizationId
    });
    expect(workerFactory).toHaveBeenCalledTimes(2);
    adapter.close();
  });

  it("discards a worker that returns malformed image output", async () => {
    const firstWorker = createWorker(async () =>
      JSON.stringify({
        format: "jpeg",
        width: 2,
        height: 1,
        dataBase64: "QUJDREVGR0g="
      })
    );
    const secondWorker = createWorker(async () => validPngNativeOutput);
    const workerFactory = vi
      .fn<WindowsScreenCaptureNativeWorkerFactory>()
      .mockReturnValueOnce(firstWorker)
      .mockReturnValueOnce(secondWorker);
    const adapter = createWindowsScreenCaptureAdapter({
      workerFactory,
      platform: "win32",
      now: () => now
    });

    await expect(adapter.capturePrimaryScreen(validGrant)).rejects.toThrow(
      WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE
    );
    expect(firstWorker.close).toHaveBeenCalledTimes(1);
    await expect(adapter.capturePrimaryScreen(validGrant)).resolves.toMatchObject({ format: "png" });
    expect(workerFactory).toHaveBeenCalledTimes(2);
    adapter.close();
  });

  it("closes the one-shot adapter after success and failure", async () => {
    const successWorker = createWorker(async () => validNativeOutput);
    await expect(
      capturePrimaryScreen(validGrant, {
        workerFactory: () => successWorker,
        platform: "win32",
        now: () => now
      })
    ).resolves.toMatchObject({ format: "jpeg" });
    expect(successWorker.close).toHaveBeenCalledTimes(1);

    const failureWorker = createWorker(async () => {
      throw new Error("raw-screen-content token=private");
    });
    await expect(
      capturePrimaryScreen(validGrant, {
        workerFactory: () => failureWorker,
        platform: "win32",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);
    expect(failureWorker.close).toHaveBeenCalledTimes(1);
  });

  it("rejects ambiguous runner and worker configuration before native work", () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);
    const workerFactory = vi.fn<WindowsScreenCaptureNativeWorkerFactory>(() =>
      createWorker(async () => validNativeOutput)
    );

    expect(() =>
      createWindowsScreenCaptureAdapter({
        runner,
        workerFactory,
        platform: "win32",
        now: () => now
      })
    ).toThrow(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
    expect(runner).not.toHaveBeenCalled();
    expect(workerFactory).not.toHaveBeenCalled();
  });

  it("rejects malformed native output with a metadata-only error", async () => {
    const runner = vi
      .fn<WindowsScreenCaptureNativeRunner>()
      .mockResolvedValue("{\"format\":\"png\",\"dataBase64\":\"credential-token-secret\"}");

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.not.toThrow(/credential-token-secret/);
  });

  it("rejects runner failures without exposing command output", async () => {
    const runner = vi
      .fn<WindowsScreenCaptureNativeRunner>()
      .mockRejectedValue(new Error("raw-screen-bytes pairing-code=123-456"));

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.not.toThrow(/raw-screen-bytes|123-456/);
  });

  it("rejects oversized encoded frame data", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(
      JSON.stringify({
        format: "jpeg",
        width: 1,
        height: 1,
        dataBase64: "/9j/"
      })
    );

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now,
        maxDataBase64Bytes: 3
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
  });

  it("rejects base64 data that is not a JPEG frame", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(
      JSON.stringify({
        format: "jpeg",
        width: 1,
        height: 1,
        dataBase64: "QUJDREVGR0g="
      })
    );

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
  });

  it("rejects unsafe adapter bounds before native capture", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now,
        maxDataBase64Bytes: 48 * 1024 + 1
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
    expect(runner).not.toHaveBeenCalled();
  });

  it("rejects unsafe queue bounds before native capture", () => {
    const workerFactory = vi.fn<WindowsScreenCaptureNativeWorkerFactory>(() =>
      createWorker(async () => validNativeOutput)
    );

    expect(() =>
      createWindowsScreenCaptureAdapter({
        workerFactory,
        platform: "win32",
        now: () => now,
        maxQueueSize: 3
      })
    ).toThrow(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
    expect(workerFactory).not.toHaveBeenCalled();
  });

  it("uses a fixed non-interactive PowerShell command", () => {
    expect(createPowerShellPrimaryScreenCaptureCommand().slice(0, 3)).toEqual([
      "-NoProfile",
      "-NonInteractive",
      "-Command"
    ]);
    expect(createPowerShellPrimaryScreenCaptureCommand().join(" ")).not.toMatch(
      /ExecutionPolicy|Bypass|Invoke-Expression/
    );
    expect(createPowerShellPrimaryScreenCaptureCommand().join(" ")).toContain('format = "jpeg"');
  });
});

function createWorker(
  runImplementation: WindowsScreenCaptureNativeWorker["run"]
): WindowsScreenCaptureNativeWorker {
  return {
    run: vi.fn<WindowsScreenCaptureNativeWorker["run"]>(runImplementation),
    close: vi.fn()
  };
}

function createDeferred<T>(): {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: Error): void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}
