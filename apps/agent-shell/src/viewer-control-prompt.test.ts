import { PassThrough, Writable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import {
  parseViewerControlCommand,
  startInteractiveViewerControlPrompt
} from "./viewer-control-prompt.js";
import type { AgentShellRuntime } from "./runtime.js";

describe("interactive viewer control prompt", () => {
  it("parses exact viewer control commands", () => {
    expect(parseViewerControlCommand("status")).toEqual({ action: "status" });
    expect(parseViewerControlCommand("disconnect")).toEqual({ action: "disconnect" });
  });

  it("rejects malformed or unsafe command lines", () => {
    for (const line of [
      "",
      " status",
      "status ",
      "Status",
      "status raw-token",
      " disconnect",
      "disconnect ",
      "Disconnect",
      "disconnect raw-token",
      "pause",
      "resume",
      "terminate",
      "revoke screen:view",
      "raw-token"
    ]) {
      expect(parseViewerControlCommand(line)).toBeUndefined();
    }
  });

  it("prints viewer status without invoking controls or public sends", async () => {
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockReturnValue({
      state: "active",
      authorizationStatus: "active",
      authorizationId: "authz_viewer_control_1",
      visibleToHost: true,
      permissionCount: 1
    });
    const output = createCapturingOutput();

    startInteractiveViewerControlPrompt(runtime, {
      input: PassThrough.from(["status\n"]),
      output
    });
    await waitForText(output, (text) => text.includes("[winbridge-agent] viewer status"));

    expect(runtime.getViewerStatus).toHaveBeenCalledTimes(1);
    expect(runtime.stop).not.toHaveBeenCalled();
    expect(runtime.getHostStatus).not.toHaveBeenCalled();
    expect(runtime.pause).not.toHaveBeenCalled();
    expect(runtime.resume).not.toHaveBeenCalled();
    expect(runtime.revokePermission).not.toHaveBeenCalled();
    expect(runtime.terminate).not.toHaveBeenCalled();
    expect(runtime.disconnect).not.toHaveBeenCalled();
    expect(runtime.send).not.toHaveBeenCalled();
    expect(output.text()).toContain("state=active");
    expect(output.text()).toContain("authorizationStatus=active");
    expect(output.text()).toContain("authorizationId=authz_viewer_control_1");
    expect(output.text()).toContain("visibleToHost=true");
    expect(output.text()).toContain("permissionCount=1");
    expect(output.text()).not.toContain("screen:view");
    expect(output.text()).not.toContain("Viewer Support");
    expect(output.text()).not.toContain("raw-token");
  });

  it("stops only the local viewer runtime for disconnect", async () => {
    const runtime = createRuntimeSpy();
    const output = createCapturingOutput();

    startInteractiveViewerControlPrompt(runtime, {
      input: PassThrough.from(["disconnect\n"]),
      output
    });
    await waitForText(output, (text) => text.includes("viewer control accepted"));

    expect(runtime.stop).toHaveBeenCalledTimes(1);
    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.getHostStatus).not.toHaveBeenCalled();
    expect(runtime.pause).not.toHaveBeenCalled();
    expect(runtime.resume).not.toHaveBeenCalled();
    expect(runtime.revokePermission).not.toHaveBeenCalled();
    expect(runtime.terminate).not.toHaveBeenCalled();
    expect(runtime.disconnect).not.toHaveBeenCalled();
    expect(runtime.send).not.toHaveBeenCalled();
    expect(output.text()).toContain("action=disconnect");
    expect(output.text()).not.toContain("screen:view");
    expect(output.text()).not.toContain("raw-token");
  });

  it("rejects malformed commands without invoking runtime operations or echoing input", async () => {
    const runtime = createRuntimeSpy();
    const output = createCapturingOutput();
    const input = PassThrough.from([
      " status\n",
      "disconnect raw-token\n",
      "revoke screen:view\n",
      "raw-token\n"
    ]);

    startInteractiveViewerControlPrompt(runtime, { input, output });
    await waitForText(output, (text) => countMatches(text, "viewer control rejected") === 4);

    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.stop).not.toHaveBeenCalled();
    expect(runtime.pause).not.toHaveBeenCalled();
    expect(runtime.resume).not.toHaveBeenCalled();
    expect(runtime.revokePermission).not.toHaveBeenCalled();
    expect(runtime.terminate).not.toHaveBeenCalled();
    expect(runtime.disconnect).not.toHaveBeenCalled();
    expect(runtime.send).not.toHaveBeenCalled();
    expect(output.text()).not.toContain("screen:view");
    expect(output.text()).not.toContain("raw-token");
  });

  it("formats status failures without raw exception text", async () => {
    const rawErrorMessage = "viewer status failed with raw-token at C:\\Users\\Nur\\secret";
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.getViewerStatus).mockImplementation(() => {
      throw new Error(rawErrorMessage);
    });
    const output = createCapturingOutput();

    startInteractiveViewerControlPrompt(runtime, {
      input: PassThrough.from(["status\n"]),
      output
    });
    await waitForText(output, (text) => text.includes("[winbridge-agent] error messageBytes="));

    expect(output.text()).toContain(`[winbridge-agent] error messageBytes=${Buffer.byteLength(rawErrorMessage)}`);
    expect(output.text()).not.toContain(rawErrorMessage);
    expect(output.text()).not.toContain("raw-token");
    expect(output.text()).not.toContain("C:\\Users\\Nur");
  });

  it("formats disconnect failures without raw exception text", async () => {
    const rawErrorMessage = "viewer disconnect failed with raw-token at C:\\Users\\Nur\\secret";
    const runtime = createRuntimeSpy();
    vi.mocked(runtime.stop).mockRejectedValue(new Error(rawErrorMessage));
    const output = createCapturingOutput();

    startInteractiveViewerControlPrompt(runtime, {
      input: PassThrough.from(["disconnect\n"]),
      output
    });
    await waitForText(output, (text) => text.includes("[winbridge-agent] error messageBytes="));

    expect(output.text()).toContain(`[winbridge-agent] error messageBytes=${Buffer.byteLength(rawErrorMessage)}`);
    expect(output.text()).not.toContain(rawErrorMessage);
    expect(output.text()).not.toContain("raw-token");
    expect(output.text()).not.toContain("C:\\Users\\Nur");
  });

  it("stops without invoking operations when stdin closes", async () => {
    const runtime = createRuntimeSpy();
    const output = createCapturingOutput();

    startInteractiveViewerControlPrompt(runtime, {
      input: PassThrough.from([]),
      output
    });
    await waitForText(output, (text) => text.includes("viewer control prompt stopped"));

    expect(runtime.getViewerStatus).not.toHaveBeenCalled();
    expect(runtime.stop).not.toHaveBeenCalled();
    expect(runtime.pause).not.toHaveBeenCalled();
    expect(runtime.resume).not.toHaveBeenCalled();
    expect(runtime.revokePermission).not.toHaveBeenCalled();
    expect(runtime.terminate).not.toHaveBeenCalled();
    expect(runtime.disconnect).not.toHaveBeenCalled();
    expect(runtime.send).not.toHaveBeenCalled();
  });
});

function createRuntimeSpy(): AgentShellRuntime {
  return {
    start: vi.fn(),
    stop: vi.fn(async () => undefined),
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

async function waitForText(
  output: { text(): string },
  predicate: (text: string) => boolean
): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate(output.text())) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 5));
  }

  throw new Error(`Timed out waiting for output. Current output: ${output.text()}`);
}

function countMatches(text: string, pattern: string): number {
  return text.split(pattern).length - 1;
}
