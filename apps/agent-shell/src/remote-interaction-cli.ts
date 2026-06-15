import type { Writable } from "node:stream";
import type { AgentShellDevInputEventArgs, AgentShellDevScreenFrameArgs } from "./args.js";
import { formatAgentShellCliError } from "./cli-diagnostics.js";
import type {
  AgentShellHostStatusSnapshot,
  AgentShellRuntime,
  AgentShellViewerStatusSnapshot
} from "./runtime.js";
import {
  assertAgentShellPositiveSchedulerDelayMs,
  assertAgentShellSchedulerDelayMs
} from "./scheduler-delay.js";

const DEFAULT_REMOTE_INTERACTION_POLL_INTERVAL_MS = 25;

export type RemoteInteractionCliOptions = {
  output?: Writable;
  pollIntervalMs?: number;
};

export type RemoteInteractionCliHandle = {
  stop(): void;
};

type RemoteInteractionStatusSnapshot =
  | AgentShellHostStatusSnapshot
  | AgentShellViewerStatusSnapshot;

type ReadyRemoteInteractionStatusSnapshot = RemoteInteractionStatusSnapshot & {
  authorizationId: string;
};

export function scheduleDevelopmentScreenFrameSend(
  runtime: Pick<AgentShellRuntime, "getHostStatus" | "sendScreenFrame">,
  args: AgentShellDevScreenFrameArgs,
  options: RemoteInteractionCliOptions = {}
): RemoteInteractionCliHandle {
  return scheduleDevelopmentRemoteInteraction(args.afterMs, options, () => {
    const status = runtime.getHostStatus();
    if (!isReadyRemoteInteractionStatus(status)) {
      return "waiting";
    }

    runtime.sendScreenFrame({
      authorizationId: status.authorizationId,
      ...args.frame
    });

    return "done";
  });
}

export function scheduleDevelopmentInputEventSend(
  runtime: Pick<AgentShellRuntime, "getViewerStatus" | "sendInputEvent">,
  args: AgentShellDevInputEventArgs,
  options: RemoteInteractionCliOptions = {}
): RemoteInteractionCliHandle {
  return scheduleDevelopmentRemoteInteraction(args.afterMs, options, () => {
    const status = runtime.getViewerStatus();
    if (!isReadyRemoteInteractionStatus(status)) {
      return "waiting";
    }

    runtime.sendInputEvent({
      authorizationId: status.authorizationId,
      ...args.input
    });

    return "done";
  });
}

function scheduleDevelopmentRemoteInteraction(
  afterMs: number,
  options: RemoteInteractionCliOptions,
  attempt: () => "waiting" | "done"
): RemoteInteractionCliHandle {
  assertAgentShellSchedulerDelayMs(afterMs);

  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_REMOTE_INTERACTION_POLL_INTERVAL_MS;
  assertAgentShellPositiveSchedulerDelayMs(pollIntervalMs);

  const output = options.output ?? process.stderr;
  let stopped = false;
  let pollTimer: ReturnType<typeof setInterval> | undefined;
  const startTimer = setTimeout(() => {
    if (stopped) {
      return;
    }

    const tick = () => {
      if (stopped) {
        return;
      }

      try {
        if (attempt() === "done") {
          stop();
        }
      } catch (error) {
        output.write(`${formatAgentShellCliError(error)}\n`);
        stop();
      }
    };

    pollTimer = setInterval(tick, pollIntervalMs);
    tick();
  }, afterMs);

  const stop = () => {
    if (stopped) {
      return;
    }

    stopped = true;
    clearTimeout(startTimer);
    if (pollTimer) {
      clearInterval(pollTimer);
    }
  };

  return { stop };
}

function isReadyRemoteInteractionStatus(
  status: RemoteInteractionStatusSnapshot
): status is ReadyRemoteInteractionStatusSnapshot {
  return (
    status.state === "active" &&
    status.visibleToHost &&
    status.authorizationStatus === "active" &&
    typeof status.authorizationId === "string"
  );
}
