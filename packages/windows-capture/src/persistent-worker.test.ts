import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_WINDOWS_CAPTURE_WORKER_MAX_RESPONSE_BYTES,
  WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE,
  createPowerShellWindowsScreenCaptureWorker,
  createPowerShellWindowsScreenCaptureWorkerCommand,
  type WindowsScreenCaptureNativeRequest
} from "./index.js";

const nativeRequest: WindowsScreenCaptureNativeRequest = {
  timeoutMs: 100,
  maxDataBase64Bytes: 48 * 1024,
  maxOutputBytes: 48 * 1024 + 4096
};

const validFrame = {
  format: "jpeg",
  width: 2,
  height: 1,
  dataBase64: "/9j/4AAQSkZJRg=="
} as const;

describe("persistent Windows screen capture worker", () => {
  it("reuses one process and sends only internal request ids", async () => {
    const child = new FakeWorkerProcess();
    child.onInputLine((line) => {
      const request = JSON.parse(line) as { requestId: number };
      child.writeResponse({ requestId: request.requestId, ok: true, ...validFrame });
    });
    const processFactory = vi.fn(() => child.asChildProcess());
    const worker = createPowerShellWindowsScreenCaptureWorker({ processFactory });

    await expect(worker.run(nativeRequest)).resolves.toBe(JSON.stringify(validFrame));
    await expect(worker.run(nativeRequest)).resolves.toBe(JSON.stringify(validFrame));

    expect(processFactory).toHaveBeenCalledTimes(1);
    expect(child.inputLines.map((line) => JSON.parse(line))).toEqual([
      { requestId: 1 },
      { requestId: 2 }
    ]);
    const childInput = child.inputLines.join("\n");
    expect(childInput).not.toMatch(
      /timeout|maxData|maxOutput|authorization|session|frameId|token|pairing|credential|path|endpoint|command|script/i
    );
    worker.close();
  });

  it("accepts one fragmented near-limit correlated response", async () => {
    const child = new FakeWorkerProcess();
    const dataBase64 = createNearLimitJpegBase64();
    child.onInputLine((line) => {
      const { requestId } = JSON.parse(line) as { requestId: number };
      const response = Buffer.from(
        `${JSON.stringify({
          requestId,
          ok: true,
          format: "jpeg",
          width: 1280,
          height: 720,
          dataBase64
        })}\r\n`,
        "utf8"
      );
      expect(response.byteLength).toBeLessThanOrEqual(
        DEFAULT_WINDOWS_CAPTURE_WORKER_MAX_RESPONSE_BYTES
      );
      child.stdout.write(response.subarray(0, 37));
      child.stdout.write(response.subarray(37, response.byteLength - 11));
      child.stdout.write(response.subarray(response.byteLength - 11));
    });
    const worker = createPowerShellWindowsScreenCaptureWorker({
      processFactory: () => child.asChildProcess()
    });

    const output = await worker.run(nativeRequest);

    expect(JSON.parse(output)).toEqual({
      format: "jpeg",
      width: 1280,
      height: 720,
      dataBase64
    });
    worker.close();
  });

  it("rejects malformed, failed, mismatched, extra, and trailing responses", async () => {
    const rawDiagnostic = "raw-screen-content token=private C:\\Users\\secret";
    const responses = [
      "not-json\n",
      `${JSON.stringify({ requestId: 1, ok: false })}\n`,
      `${JSON.stringify({ requestId: 99, ok: true, ...validFrame })}\n`,
      `${JSON.stringify({ requestId: 1, ok: true, ...validFrame, diagnostic: rawDiagnostic })}\n`,
      `${JSON.stringify({ requestId: 1, ok: true, ...validFrame })}\ntrailing-output`
    ];

    for (const response of responses) {
      const child = new FakeWorkerProcess();
      child.onInputLine(() => child.stdout.write(response));
      const worker = createPowerShellWindowsScreenCaptureWorker({
        processFactory: () => child.asChildProcess()
      });

      const failure = await worker.run(nativeRequest).catch((error) => error);

      expect(failure).toEqual(new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE));
      expect(String(failure)).not.toContain(rawDiagnostic);
      expect(String(failure)).not.toContain("raw-screen-content");
      expect(child.kill).toHaveBeenCalledTimes(1);
    }
  });

  it("rejects oversized stdout before parsing", async () => {
    const child = new FakeWorkerProcess();
    child.onInputLine(() =>
      child.stdout.write(Buffer.alloc(DEFAULT_WINDOWS_CAPTURE_WORKER_MAX_RESPONSE_BYTES + 1, 0x41))
    );
    const worker = createPowerShellWindowsScreenCaptureWorker({
      processFactory: () => child.asChildProcess()
    });

    await expect(worker.run(nativeRequest)).rejects.toThrow(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("rejects oversized frame data inside the protocol overhead bound", async () => {
    const child = new FakeWorkerProcess();
    child.onInputLine(() =>
      child.writeResponse({
        requestId: 1,
        ok: true,
        format: "jpeg",
        width: 1,
        height: 1,
        dataBase64: "A".repeat(48 * 1024 + 4)
      })
    );
    const worker = createPowerShellWindowsScreenCaptureWorker({
      processFactory: () => child.asChildProcess()
    });

    await expect(worker.run(nativeRequest)).rejects.toThrow(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("rejects non-canonical native requests before stdin", async () => {
    const rawMetadata = "raw-token C:\\Users\\secret arbitrary-command";
    const invalidRequests = [
      { ...nativeRequest, timeoutMs: 0 },
      { ...nativeRequest, maxDataBase64Bytes: nativeRequest.maxDataBase64Bytes - 4 },
      { ...nativeRequest, maxOutputBytes: nativeRequest.maxOutputBytes - 1 },
      { ...nativeRequest, diagnostic: rawMetadata }
    ];

    for (const invalidRequest of invalidRequests) {
      const child = new FakeWorkerProcess();
      const worker = createPowerShellWindowsScreenCaptureWorker({
        processFactory: () => child.asChildProcess()
      });

      const failure = await worker
        .run(invalidRequest as WindowsScreenCaptureNativeRequest)
        .catch((error) => error);

      expect(failure).toEqual(new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE));
      expect(String(failure)).not.toContain(rawMetadata);
      expect(child.inputLines).toHaveLength(0);
      expect(child.kill).toHaveBeenCalledTimes(1);
    }
  });

  it("times out without exposing native diagnostics", async () => {
    const child = new FakeWorkerProcess();
    child.onInputLine(() => undefined);
    const worker = createPowerShellWindowsScreenCaptureWorker({
      processFactory: () => child.asChildProcess()
    });

    await expect(worker.run({ ...nativeRequest, timeoutMs: 5 })).rejects.toThrow(
      WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE
    );
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("treats stderr as generic failure", async () => {
    const child = new FakeWorkerProcess();
    const rawDiagnostic = "GDI raw-screen-content token=private C:\\Users\\secret";
    child.onInputLine(() => child.stderr.write(rawDiagnostic));
    const worker = createPowerShellWindowsScreenCaptureWorker({
      processFactory: () => child.asChildProcess()
    });

    const failure = await worker.run(nativeRequest).catch((error) => error);

    expect(failure).toEqual(new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE));
    expect(String(failure)).not.toContain(rawDiagnostic);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("treats process error and exit as generic failures", async () => {
    for (const event of ["error", "exit"] as const) {
      const child = new FakeWorkerProcess();
      child.onInputLine(() => {
        if (event === "error") {
          child.emit("error", new Error("raw process diagnostic"));
        } else {
          child.emit("exit", 1, null);
        }
      });
      const worker = createPowerShellWindowsScreenCaptureWorker({
        processFactory: () => child.asChildProcess()
      });

      const failure = await worker.run(nativeRequest).catch((error) => error);

      expect(failure).toEqual(new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE));
      expect(String(failure)).not.toContain("raw process diagnostic");
      expect(child.kill).toHaveBeenCalledTimes(1);
    }
  });

  it("treats stdin callback failure as generic failure", async () => {
    const child = new FakeWorkerProcess();
    child.failStdinWrites(new Error("raw stdin token=private"));
    const worker = createPowerShellWindowsScreenCaptureWorker({
      processFactory: () => child.asChildProcess()
    });

    const failure = await worker.run(nativeRequest).catch((error) => error);

    expect(failure).toEqual(new Error(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE));
    expect(String(failure)).not.toContain("raw stdin");
    expect(child.inputLines).toHaveLength(0);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("close is idempotent and rejects an active request", async () => {
    const child = new FakeWorkerProcess();
    child.onInputLine(() => undefined);
    const worker = createPowerShellWindowsScreenCaptureWorker({
      processFactory: () => child.asChildProcess()
    });
    const active = worker.run(nativeRequest);
    await vi.waitFor(() => expect(child.inputLines).toHaveLength(1));

    worker.close();
    worker.close();

    await expect(active).rejects.toThrow(WINDOWS_CAPTURE_WORKER_ERROR_MESSAGE);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("uses a fixed foreground-only PowerShell command", () => {
    const command = createPowerShellWindowsScreenCaptureWorkerCommand();
    const serialized = command.join(" ");

    expect(command.slice(0, 3)).toEqual(["-NoProfile", "-NonInteractive", "-Command"]);
    expect(serialized).toContain("[Console]::In.ReadLine()" );
    expect(serialized).toContain("CopyFromScreen");
    expect(serialized).toContain("Dispose()");
    expect(serialized).not.toMatch(
      /Start-Process|New-Service|Register-ScheduledTask|Invoke-Expression|ExecutionPolicy|Bypass/
    );
  });
});

function createNearLimitJpegBase64(): string {
  const bytes = Buffer.alloc((48 * 1024 * 3) / 4, 0x41);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  const dataBase64 = bytes.toString("base64");
  expect(Buffer.byteLength(dataBase64, "utf8")).toBe(48 * 1024);
  return dataBase64;
}

class FakeWorkerProcess extends EventEmitter {
  readonly stdin = new PassThrough();
  readonly stdout = new PassThrough();
  readonly stderr = new PassThrough();
  readonly inputLines: string[] = [];
  readonly kill = vi.fn(() => true);
  private inputBuffer = "";
  private inputHandler: ((line: string) => void) | undefined;

  constructor() {
    super();
    this.stdin.setEncoding("utf8");
    this.stdin.on("data", (chunk: string) => {
      this.inputBuffer += chunk;
      let newlineIndex = this.inputBuffer.indexOf("\n");
      while (newlineIndex >= 0) {
        const line = this.inputBuffer.slice(0, newlineIndex);
        this.inputBuffer = this.inputBuffer.slice(newlineIndex + 1);
        this.inputLines.push(line);
        this.inputHandler?.(line);
        newlineIndex = this.inputBuffer.indexOf("\n");
      }
    });
  }

  onInputLine(handler: (line: string) => void): void {
    this.inputHandler = handler;
  }

  writeResponse(response: unknown): void {
    this.stdout.write(`${JSON.stringify(response)}\n`);
  }

  failStdinWrites(error: Error): void {
    this.stdin.write = ((...args: unknown[]) => {
      const callback = args.find((argument) => typeof argument === "function") as
        | ((writeError?: Error | null) => void)
        | undefined;
      queueMicrotask(() => callback?.(error));
      return false;
    }) as typeof this.stdin.write;
  }

  asChildProcess(): ChildProcessWithoutNullStreams {
    return this as unknown as ChildProcessWithoutNullStreams;
  }
}
