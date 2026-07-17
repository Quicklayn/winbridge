import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { describe, expect, it, vi } from "vitest";
import {
  WINDOWS_INPUT_WORKER_ERROR_MESSAGE,
  createPowerShellWindowsInputWorker,
  createPowerShellWindowsInputWorkerCommand,
  type WindowsInputNativeRequest
} from "./index.js";

const pointerRequest: WindowsInputNativeRequest = {
  timeoutMs: 100,
  event: {
    kind: "pointer-move",
    x: 0.5,
    y: 0.25,
    xAbsolute: 32768,
    yAbsolute: 16384,
    buttons: 1
  }
};

describe("persistent Windows input worker", () => {
  it("uses one bounded request-response process protocol", async () => {
    const child = new FakeWorkerProcess();
    const requests: unknown[] = [];
    child.onInputLine((line) => {
      const request = JSON.parse(line) as { requestId: number };
      requests.push(request);
      child.stdout.write(`{"requestId":${request.requestId},"applied":true}\n`);
    });
    const processFactory = vi.fn(() => child.asChildProcess());
    const worker = createPowerShellWindowsInputWorker({ processFactory });

    await expect(worker.run(pointerRequest)).resolves.toBe("{\"applied\":true}");
    await expect(worker.run(pointerRequest)).resolves.toBe("{\"applied\":true}");
    expect(processFactory).toHaveBeenCalledTimes(1);
    expect(requests).toEqual([
      {
        requestId: 1,
        event: { kind: "pointer-move", xAbsolute: 32768, yAbsolute: 16384 }
      },
      {
        requestId: 2,
        event: { kind: "pointer-move", xAbsolute: 32768, yAbsolute: 16384 }
      }
    ]);
    expect(JSON.stringify(requests)).not.toContain("timeoutMs");
    expect(JSON.stringify(requests)).not.toContain("authorizationId");
    expect(JSON.stringify(requests)).not.toContain("pairingCode");
    expect(JSON.stringify(requests)).not.toContain('"x":');
    expect(JSON.stringify(requests)).not.toContain('"y":');
    worker.close();
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("rejects mismatched responses and terminates the worker", async () => {
    const child = new FakeWorkerProcess();
    child.onInputLine(() => child.stdout.write("{\"requestId\":999,\"applied\":true}\n"));
    const worker = createPowerShellWindowsInputWorker({
      processFactory: () => child.asChildProcess()
    });

    await expect(worker.run(pointerRequest)).rejects.toThrow(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("rejects extra request metadata before writing to the helper", async () => {
    const child = new FakeWorkerProcess();
    const rawMetadata = "KeyZ control raw-token";
    const worker = createPowerShellWindowsInputWorker({
      processFactory: () => child.asChildProcess()
    });
    const requestWithExtraMetadata = {
      ...pointerRequest,
      event: {
        ...pointerRequest.event,
        diagnostic: rawMetadata
      }
    } as WindowsInputNativeRequest;

    const failure = await worker.run(requestWithExtraMetadata).catch((error) => error);

    expect(failure).toEqual(new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE));
    expect(child.inputLines).toHaveLength(0);
    expect(JSON.stringify(child.inputLines)).not.toContain(rawMetadata);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("rejects failed or diagnostic-bearing responses", async () => {
    const child = new FakeWorkerProcess();
    const rawDiagnostic = "KeyA control raw-token";
    child.onInputLine(() =>
      child.stdout.write(
        `${JSON.stringify({ requestId: 1, applied: false, diagnostic: rawDiagnostic })}\n`
      )
    );
    const worker = createPowerShellWindowsInputWorker({
      processFactory: () => child.asChildProcess()
    });

    const failure = await worker.run(pointerRequest).catch((error) => error);
    expect(failure).toEqual(new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE));
    expect(String(failure)).not.toContain(rawDiagnostic);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("bounds stdout before parsing", async () => {
    const child = new FakeWorkerProcess();
    child.onInputLine(() => child.stdout.write("x".repeat(513)));
    const worker = createPowerShellWindowsInputWorker({
      processFactory: () => child.asChildProcess()
    });

    await expect(worker.run(pointerRequest)).rejects.toThrow(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("times out without exposing process output", async () => {
    const child = new FakeWorkerProcess();
    child.onInputLine(() => undefined);
    const worker = createPowerShellWindowsInputWorker({
      processFactory: () => child.asChildProcess()
    });

    await expect(worker.run({ ...pointerRequest, timeoutMs: 5 })).rejects.toThrow(
      WINDOWS_INPUT_WORKER_ERROR_MESSAGE
    );
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("treats stderr as generic failure", async () => {
    const child = new FakeWorkerProcess();
    const rawDiagnostic = "SendInput KeyZ raw-token failure";
    child.onInputLine(() => child.stderr.write(rawDiagnostic));
    const worker = createPowerShellWindowsInputWorker({
      processFactory: () => child.asChildProcess()
    });

    const failure = await worker.run(pointerRequest).catch((error) => error);
    expect(failure).toEqual(new Error(WINDOWS_INPUT_WORKER_ERROR_MESSAGE));
    expect(String(failure)).not.toContain(rawDiagnostic);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("treats unexpected process exit as generic failure", async () => {
    const child = new FakeWorkerProcess();
    child.onInputLine(() => child.emit("exit", 1, null));
    const worker = createPowerShellWindowsInputWorker({
      processFactory: () => child.asChildProcess()
    });

    await expect(worker.run(pointerRequest)).rejects.toThrow(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("close is idempotent and rejects an active request", async () => {
    const child = new FakeWorkerProcess();
    child.onInputLine(() => undefined);
    const worker = createPowerShellWindowsInputWorker({
      processFactory: () => child.asChildProcess()
    });
    const active = worker.run(pointerRequest);
    await vi.waitFor(() => expect(child.inputLines).toHaveLength(1));

    worker.close();
    worker.close();

    await expect(active).rejects.toThrow(WINDOWS_INPUT_WORKER_ERROR_MESSAGE);
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it("uses a fixed non-persistent PowerShell worker command", () => {
    const command = createPowerShellWindowsInputWorkerCommand();
    const serialized = command.join(" ");

    expect(command.slice(0, 3)).toEqual(["-NoProfile", "-NonInteractive", "-Command"]);
    expect(serialized).toContain("[Console]::In.ReadLine()");
    expect(serialized).toContain("SendInput");
    expect(serialized).not.toContain("Start-Process");
    expect(serialized).not.toContain("New-Service");
    expect(serialized).not.toContain("Register-ScheduledTask");
    expect(serialized).not.toContain("Invoke-Expression");
  });
});

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

  asChildProcess(): ChildProcessWithoutNullStreams {
    return this as unknown as ChildProcessWithoutNullStreams;
  }
}
