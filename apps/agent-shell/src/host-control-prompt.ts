import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";
import { PermissionSchema, type Permission } from "@winbridge/protocol";
import { formatAgentShellCliError } from "./cli-diagnostics.js";
import { isControlPromptCommandLineTooLong } from "./control-prompt-input.js";
import type { AgentShellHostStatusSnapshot, AgentShellRuntime } from "./runtime.js";

export type HostControlPromptStreams = {
  input?: Readable;
  output?: Writable;
};

export type HostControlPromptOptions = HostControlPromptStreams;

export type HostControlPromptHandle = {
  stop(): void;
};

export type HostControlCommand =
  | { action: "help" }
  | { action: "status" }
  | { action: "pause" }
  | { action: "resume" }
  | { action: "terminate" }
  | { action: "disconnect" }
  | { action: "revoke"; permission: Permission };

export type HostLifecycleControlCommand = Exclude<
  HostControlCommand,
  { action: "help" } | { action: "status" }
>;

export type HostLifecycleControlRuntime = Pick<
  AgentShellRuntime,
  "pause" | "resume" | "terminate" | "disconnect" | "revokePermission"
>;

const HOST_CONTROL_PROMPT_TEXT =
  "[winbridge-agent] Host controls: help | status | pause | resume | revoke <permission> | terminate | disconnect\n";
const HOST_CONTROL_ACCEPTED_PREFIX = "[winbridge-agent] host control accepted";
const HOST_CONTROL_REJECTED_MESSAGE = "[winbridge-agent] host control rejected";
const HOST_CONTROL_STOPPED_MESSAGE = "[winbridge-agent] host control prompt stopped\n";
const HOST_CONTROL_STATUS_PREFIX = "[winbridge-agent] host status";
const HOST_CONTROL_HELP_TEXT =
  "[winbridge-agent] host control help commands=help,status,pause,resume,revoke screen:view,revoke input:pointer,revoke input:keyboard,terminate,disconnect\n";

export function startInteractiveHostControlPrompt(
  runtime: AgentShellRuntime,
  options: HostControlPromptOptions = {}
): HostControlPromptHandle {
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const readline = createInterface({ input, output, terminal: false });
  let stopped = false;

  const stopPrompt = () => {
    if (stopped) {
      return;
    }

    stopped = true;
    readline.close();
  };

  output.write(HOST_CONTROL_PROMPT_TEXT);

  readline.on("line", (line) => {
    if (stopped) {
      return;
    }

    handleHostControlLine(runtime, output, stopPrompt, line);
  });
  readline.once("close", () => {
    if (!stopped) {
      stopped = true;
      output.write(HOST_CONTROL_STOPPED_MESSAGE);
    }
  });

  return {
    stop() {
      stopPrompt();
    }
  };
}

export function parseHostControlCommand(line: string): HostControlCommand | undefined {
  switch (line) {
    case "help":
      return { action: "help" };
    case "status":
      return { action: "status" };
    case "pause":
      return { action: "pause" };
    case "resume":
      return { action: "resume" };
    case "terminate":
      return { action: "terminate" };
    case "disconnect":
      return { action: "disconnect" };
    default:
      return parseRevokeCommand(line);
  }
}

export function formatHostControlStatus(status: AgentShellHostStatusSnapshot): string {
  const parts = [
    HOST_CONTROL_STATUS_PREFIX,
    `state=${status.state}`,
    `visibleToHost=${status.visibleToHost}`,
    `permissionCount=${status.permissionCount}`
  ];

  if (status.authorizationStatus) {
    parts.push(`authorizationStatus=${status.authorizationStatus}`);
  }

  if (status.authorizationId) {
    parts.push(`authorizationId=${status.authorizationId}`);
  }

  if (status.expiresAt) {
    parts.push(`expiresAt=${status.expiresAt}`);
  }

  if (status.viewerDeviceId) {
    parts.push(`viewerDeviceId=${status.viewerDeviceId}`);
  }

  if (status.viewerDevicePlatform) {
    parts.push(`viewerDevicePlatform=${status.viewerDevicePlatform}`);
  }

  if (status.inactiveCause) {
    parts.push(`inactiveCause=${status.inactiveCause}`);
  }

  if (status.remoteDisconnectReasonCode) {
    parts.push(`remoteDisconnectReasonCode=${status.remoteDisconnectReasonCode}`);
  }

  return `${parts.join(" ")}\n`;
}

export function formatHostControlHelp(): string {
  return HOST_CONTROL_HELP_TEXT;
}

function parseRevokeCommand(line: string): HostControlCommand | undefined {
  const match = /^revoke ([^\s]+)$/.exec(line);
  if (!match) {
    return undefined;
  }

  try {
    return { action: "revoke", permission: PermissionSchema.parse(match[1]) };
  } catch {
    return undefined;
  }
}

function handleHostControlLine(
  runtime: AgentShellRuntime,
  output: Writable,
  stopPrompt: () => void,
  line: string
): void {
  if (isControlPromptCommandLineTooLong(line)) {
    output.write(`${HOST_CONTROL_REJECTED_MESSAGE}\n`);
    return;
  }

  const command = parseHostControlCommand(line);
  if (!command) {
    output.write(`${HOST_CONTROL_REJECTED_MESSAGE}\n`);
    return;
  }

  try {
    if (command.action === "help") {
      output.write(formatHostControlHelp());
      return;
    }

    if (command.action === "status") {
      output.write(formatHostControlStatus(runtime.getHostStatus()));
      return;
    }

    runHostControlCommand(runtime, command);
    output.write(`${HOST_CONTROL_ACCEPTED_PREFIX} action=${command.action}\n`);
    if (command.action === "disconnect" || command.action === "terminate") {
      stopPrompt();
    }
  } catch (error) {
    output.write(`${formatAgentShellCliError(error)}\n`);
  }
}

export function runHostControlCommand(
  runtime: HostLifecycleControlRuntime,
  command: HostLifecycleControlCommand
): void {
  switch (command.action) {
    case "pause":
      runtime.pause();
      return;
    case "resume":
      runtime.resume();
      return;
    case "terminate":
      runtime.terminate();
      return;
    case "disconnect":
      runtime.disconnect();
      return;
    case "revoke":
      runtime.revokePermission(command.permission);
      return;
    default: {
      const exhaustive: never = command;
      return exhaustive;
    }
  }
}
