import type { Writable } from "node:stream";
import { formatAgentShellCliError } from "./cli-diagnostics.js";
import type { AgentShellRuntime } from "./runtime.js";
import { assertAgentShellSchedulerDelayMs } from "./scheduler-delay.js";

export type ViewerLocalDisconnectOptions = {
  output?: Writable;
};

export type ViewerLocalDisconnectHandle = {
  stop(): void;
};

export function scheduleViewerLocalDisconnect(
  runtime: Pick<AgentShellRuntime, "leave">,
  delayMs: number,
  options: ViewerLocalDisconnectOptions = {}
): ViewerLocalDisconnectHandle {
  assertAgentShellSchedulerDelayMs(delayMs);

  const output = options.output ?? process.stderr;
  let stopped = false;
  const timer = setTimeout(() => {
    if (stopped) {
      return;
    }

    stopped = true;
    runtime.leave().catch((error: unknown) => {
      output.write(`${formatAgentShellCliError(error)}\n`);
    });
  }, delayMs);

  return {
    stop() {
      if (stopped) {
        return;
      }

      stopped = true;
      clearTimeout(timer);
    }
  };
}
