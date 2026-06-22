export type AgentShellSignal = "SIGINT" | "SIGTERM";

type SignalTarget = {
  on(signal: AgentShellSignal, listener: (signal: AgentShellSignal) => void): unknown;
  off(signal: AgentShellSignal, listener: (signal: AgentShellSignal) => void): unknown;
};

export type AgentShellSignalShutdownOptions = {
  signalTarget: SignalTarget;
  shutdown: () => Promise<void> | void;
  reportError: (error: unknown) => void;
  exit: (code: 0 | 1) => void;
};

export type AgentShellSignalShutdownHandle = {
  stop(): void;
};

export function installAgentShellSignalShutdown(
  options: AgentShellSignalShutdownOptions
): AgentShellSignalShutdownHandle {
  let started = false;
  let stopped = false;

  const onSignal = () => {
    if (started) {
      return;
    }

    started = true;
    Promise.resolve()
      .then(() => options.shutdown())
      .then(() => {
        options.exit(0);
      })
      .catch((error: unknown) => {
        options.reportError(error);
        options.exit(1);
      });
  };

  options.signalTarget.on("SIGINT", onSignal);
  options.signalTarget.on("SIGTERM", onSignal);

  return {
    stop: () => {
      if (stopped) {
        return;
      }

      stopped = true;
      options.signalTarget.off("SIGINT", onSignal);
      options.signalTarget.off("SIGTERM", onSignal);
    }
  };
}
