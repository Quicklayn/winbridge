import type { Writable } from "node:stream";
import { formatAgentShellCliError } from "./cli-diagnostics.js";
import { formatHostControlStatus } from "./host-control-prompt.js";
import type { AgentShellRuntime } from "./runtime.js";
import { assertAgentShellSchedulerDelayMs } from "./scheduler-delay.js";

export type HostStatusPrintOptions = {
  output?: Writable;
};

export type HostStatusPrintHandle = {
  stop(): void;
};

export function scheduleHostStatusPrint(
  runtime: Pick<AgentShellRuntime, "getHostStatus">,
  delayMs: number,
  options: HostStatusPrintOptions = {}
): HostStatusPrintHandle {
  assertAgentShellSchedulerDelayMs(delayMs);

  const output = options.output ?? process.stdout;
  let stopped = false;
  const timer = setTimeout(() => {
    if (stopped) {
      return;
    }

    try {
      output.write(formatHostControlStatus(runtime.getHostStatus()));
    } catch (error) {
      output.write(`${formatAgentShellCliError(error)}\n`);
    }
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
