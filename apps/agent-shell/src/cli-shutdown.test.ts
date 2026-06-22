import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import {
  installAgentShellSignalShutdown,
  type AgentShellSignal
} from "./cli-shutdown.js";

class TestSignalTarget extends EventEmitter {
  on(signal: AgentShellSignal, listener: (signal: AgentShellSignal) => void): this {
    return super.on(signal, listener);
  }

  off(signal: AgentShellSignal, listener: (signal: AgentShellSignal) => void): this {
    return super.off(signal, listener);
  }
}

describe("agent shell CLI signal shutdown", () => {
  it("runs successful signal cleanup once before exiting zero", async () => {
    const signalTarget = new TestSignalTarget();
    const shutdown = vi.fn(async () => undefined);
    const reportError = vi.fn();
    const exit = vi.fn();

    const handle = installAgentShellSignalShutdown({
      signalTarget,
      shutdown,
      reportError,
      exit
    });

    signalTarget.emit("SIGINT", "SIGINT");
    signalTarget.emit("SIGTERM", "SIGTERM");
    await flushAsyncShutdown();

    expect(shutdown).toHaveBeenCalledTimes(1);
    expect(reportError).not.toHaveBeenCalled();
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(0);

    handle.stop();
    expect(signalTarget.listenerCount("SIGINT")).toBe(0);
    expect(signalTarget.listenerCount("SIGTERM")).toBe(0);
  });

  it("reports failed signal cleanup once before exiting one", async () => {
    const signalTarget = new TestSignalTarget();
    const error = new Error("shutdown failed with raw-token");
    const shutdown = vi.fn(async () => {
      throw error;
    });
    const reportError = vi.fn();
    const exit = vi.fn();

    const handle = installAgentShellSignalShutdown({
      signalTarget,
      shutdown,
      reportError,
      exit
    });

    signalTarget.emit("SIGTERM", "SIGTERM");
    signalTarget.emit("SIGINT", "SIGINT");
    await flushAsyncShutdown();

    expect(shutdown).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(error);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(1);

    handle.stop();
    expect(signalTarget.listenerCount("SIGINT")).toBe(0);
    expect(signalTarget.listenerCount("SIGTERM")).toBe(0);
  });
});

async function flushAsyncShutdown(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}
