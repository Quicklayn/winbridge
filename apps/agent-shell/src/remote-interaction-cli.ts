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

type RemoteInteractionStreamAttemptResult = "waiting" | "sent" | "done";

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

export function scheduleDevelopmentScreenFrameStream(
  runtime: Pick<AgentShellRuntime, "getHostStatus" | "sendScreenFrame">,
  args: AgentShellDevScreenFrameArgs & {
    stream: NonNullable<AgentShellDevScreenFrameArgs["stream"]>;
  },
  options: RemoteInteractionCliOptions = {}
): RemoteInteractionCliHandle {
  let sentCount = 0;
  return scheduleDevelopmentRemoteInteractionStream(
    args.afterMs,
    args.stream.intervalMs,
    options,
    () => {
      const status = runtime.getHostStatus();
      if (!isReadyRemoteInteractionStatus(status)) {
        return sentCount > 0 ? "done" : "waiting";
      }

      runtime.sendScreenFrame({
        authorizationId: status.authorizationId,
        ...args.frame,
        frameId: createDevelopmentScreenFrameStreamFrameId(args.frame.frameId, sentCount),
        sequence: args.frame.sequence + sentCount
      });
      sentCount += 1;

      return sentCount >= args.stream.count ? "done" : "sent";
    }
  );
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

function scheduleDevelopmentRemoteInteractionStream(
  afterMs: number,
  intervalMs: number,
  options: RemoteInteractionCliOptions,
  attempt: () => RemoteInteractionStreamAttemptResult
): RemoteInteractionCliHandle {
  assertAgentShellSchedulerDelayMs(afterMs);
  assertAgentShellPositiveSchedulerDelayMs(intervalMs);

  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_REMOTE_INTERACTION_POLL_INTERVAL_MS;
  assertAgentShellPositiveSchedulerDelayMs(pollIntervalMs);

  const output = options.output ?? process.stderr;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = (delayMs: number) => {
    timer = setTimeout(() => {
      if (stopped) {
        return;
      }

      try {
        const result = attempt();
        switch (result) {
          case "waiting":
            schedule(pollIntervalMs);
            return;
          case "sent":
            schedule(intervalMs);
            return;
          case "done":
            stop();
            return;
        }
      } catch (error) {
        output.write(`${formatAgentShellCliError(error)}\n`);
        stop();
      }
    }, delayMs);
  };

  const stop = () => {
    if (stopped) {
      return;
    }

    stopped = true;
    if (timer) {
      clearTimeout(timer);
    }
  };

  schedule(afterMs);

  return { stop };
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

function createDevelopmentScreenFrameStreamFrameId(baseFrameId: string, sequenceOffset: number): string {
  return `${baseFrameId}_${sequenceOffset}`;
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
