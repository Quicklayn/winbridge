import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";
import { createMessageBase, parseProtocolEnvelope } from "@winbridge/protocol";
import { formatAgentShellCliError } from "./cli-diagnostics.js";
import { isControlPromptCommandLineTooLong } from "./control-prompt-input.js";
import type {
  AgentShellInputEventInput,
  AgentShellRuntime,
  AgentShellViewerStatusSnapshot
} from "./runtime.js";
import { formatViewerStatus } from "./viewer-status.js";

export type ViewerControlPromptStreams = {
  input?: Readable;
  output?: Writable;
};

export type ViewerControlPromptOptions = ViewerControlPromptStreams;

export type ViewerControlPromptHandle = {
  stop(): void;
};

export type ViewerControlRuntime = Pick<
  AgentShellRuntime,
  "getViewerStatus" | "leave" | "sendInputEvent"
>;

export type ViewerControlCommand =
  | { action: "help" }
  | { action: "status" }
  | { action: "disconnect" }
  | { action: "input"; event: AgentShellInputEventInput["event"] };

export type ViewerControlInputAccepted = {
  action: "input";
  kind: AgentShellInputEventInput["event"]["kind"];
};

const VIEWER_CONTROL_PROMPT_TEXT =
  "[winbridge-agent] Viewer controls: help | status | disconnect | pointer/key input\n";
const VIEWER_CONTROL_ACCEPTED_PREFIX = "[winbridge-agent] viewer control accepted";
const VIEWER_CONTROL_REJECTED_MESSAGE = "[winbridge-agent] viewer control rejected";
const VIEWER_CONTROL_STOPPED_MESSAGE = "[winbridge-agent] viewer control prompt stopped\n";
const VIEWER_CONTROL_HELP_TEXT =
  "[winbridge-agent] viewer control help commands=help,status,disconnect,pointer-move x y,pointer-down x y button,pointer-up x y button,pointer-wheel x y deltaX deltaY,key-down key [modifiers],key-up key [modifiers]\n";
const VIEWER_CONTROL_INPUT_AUTHORIZATION_ERROR_MESSAGE =
  "Viewer control input requires active visible authorization";
const VIEWER_CONTROL_VALIDATION_AUTHORIZATION_ID = "authz_viewer_control_input";
const VIEWER_CONTROL_VALIDATION_FROM_PEER_ID = "viewer_control_peer";
const VIEWER_CONTROL_VALIDATION_EVENT_ID = "viewer_control_input_0";
const VIEWER_CONTROL_INPUT_EVENT_ID_PREFIX = "viewer_control_input";
const VIEWER_CONTROL_POINTER_BUTTONS = new Set([
  "primary",
  "secondary",
  "middle",
  "back",
  "forward"
]);
const VIEWER_CONTROL_KEYBOARD_MODIFIERS = new Set(["alt", "control", "meta", "shift"]);

export function startInteractiveViewerControlPrompt(
  runtime: ViewerControlRuntime,
  options: ViewerControlPromptOptions = {}
): ViewerControlPromptHandle {
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const readline = createInterface({ input, output, terminal: false });
  let stopped = false;
  let nextInputSequence = 0;

  const stopPrompt = () => {
    if (stopped) {
      return;
    }

    stopped = true;
    readline.close();
  };

  output.write(VIEWER_CONTROL_PROMPT_TEXT);

  readline.on("line", (line) => {
    if (stopped) {
      return;
    }

    handleViewerControlLine(runtime, output, stopPrompt, line, () => nextInputSequence++);
  });
  readline.once("close", () => {
    if (!stopped) {
      stopped = true;
      output.write(VIEWER_CONTROL_STOPPED_MESSAGE);
    }
  });

  return {
    stop() {
      stopPrompt();
    }
  };
}

export function parseViewerControlCommand(line: string): ViewerControlCommand | undefined {
  if (line.trim() !== line) {
    return undefined;
  }

  switch (line) {
    case "help":
      return { action: "help" };
    case "status":
      return { action: "status" };
    case "disconnect":
      return { action: "disconnect" };
    default:
      return parseViewerControlInputCommand(line);
  }
}

export function formatViewerControlHelp(): string {
  return VIEWER_CONTROL_HELP_TEXT;
}

function handleViewerControlLine(
  runtime: ViewerControlRuntime,
  output: Writable,
  stopPrompt: () => void,
  line: string,
  allocateInputSequence: () => number
): void {
  if (isControlPromptCommandLineTooLong(line)) {
    output.write(`${VIEWER_CONTROL_REJECTED_MESSAGE}\n`);
    return;
  }

  const command = parseViewerControlCommand(line);
  if (!command) {
    output.write(`${VIEWER_CONTROL_REJECTED_MESSAGE}\n`);
    return;
  }

  if (command.action === "help") {
    output.write(formatViewerControlHelp());
    return;
  }

  if (command.action === "status") {
    try {
      output.write(formatViewerStatus(runtime.getViewerStatus()));
    } catch (error) {
      output.write(`${formatAgentShellCliError(error)}\n`);
    }
    return;
  }

  if (command.action === "input") {
    try {
      const accepted = sendViewerControlInputEvent(
        runtime,
        command.event,
        allocateInputSequence
      );
      output.write(`${VIEWER_CONTROL_ACCEPTED_PREFIX} action=${accepted.action} kind=${accepted.kind}\n`);
    } catch (error) {
      output.write(`${formatAgentShellCliError(error)}\n`);
    }
    return;
  }

  Promise.resolve()
    .then(() => runtime.leave())
    .then(() => {
      output.write(`${VIEWER_CONTROL_ACCEPTED_PREFIX} action=disconnect\n`);
      stopPrompt();
    })
    .catch((error: unknown) => {
      output.write(`${formatAgentShellCliError(error)}\n`);
    });
}

export function sendViewerControlInputEvent(
  runtime: ViewerControlRuntime,
  event: AgentShellInputEventInput["event"],
  allocateInputSequence: () => number
): ViewerControlInputAccepted {
  const status = runtime.getViewerStatus();
  if (!isReadyViewerInputStatus(status)) {
    throw new Error(VIEWER_CONTROL_INPUT_AUTHORIZATION_ERROR_MESSAGE);
  }

  const sequence = allocateInputSequence();
  runtime.sendInputEvent({
    authorizationId: status.authorizationId,
    eventId: createViewerControlInputEventId(sequence),
    sequence,
    event
  });

  return { action: "input", kind: event.kind };
}

function parseViewerControlInputCommand(line: string): ViewerControlCommand | undefined {
  const tokens = line.split(" ");
  if (tokens.some((token) => token.length === 0)) {
    return undefined;
  }

  try {
    const event = parseViewerControlInputEvent(tokens);
    validateViewerControlInputEvent(event);
    return { action: "input", event };
  } catch {
    return undefined;
  }
}

function parseViewerControlInputEvent(tokens: string[]): AgentShellInputEventInput["event"] {
  const [kind] = tokens;
  switch (kind) {
    case "pointer-move":
      if (tokens.length !== 3) {
        throw new Error("Malformed pointer input command");
      }
      return {
        kind,
        x: parseViewerControlPointerCoordinate(tokens[1]),
        y: parseViewerControlPointerCoordinate(tokens[2])
      };
    case "pointer-down":
    case "pointer-up":
      if (tokens.length !== 4) {
        throw new Error("Malformed pointer button command");
      }
      return {
        kind,
        x: parseViewerControlPointerCoordinate(tokens[1]),
        y: parseViewerControlPointerCoordinate(tokens[2]),
        button: parseViewerControlPointerButton(tokens[3])
      };
    case "pointer-wheel": {
      if (tokens.length !== 5) {
        throw new Error("Malformed pointer wheel command");
      }

      const deltaX = parseViewerControlPointerDelta(tokens[3]);
      const deltaY = parseViewerControlPointerDelta(tokens[4]);
      if (deltaX === 0 && deltaY === 0) {
        throw new Error("Pointer wheel command requires non-zero delta");
      }

      return {
        kind,
        x: parseViewerControlPointerCoordinate(tokens[1]),
        y: parseViewerControlPointerCoordinate(tokens[2]),
        deltaX,
        deltaY
      };
    }
    case "key-down":
    case "key-up":
      if (tokens.length < 2 || tokens.length > 3) {
        throw new Error("Malformed keyboard command");
      }
      if (!tokens[1]) {
        throw new Error("Malformed keyboard command");
      }
      return {
        kind,
        key: tokens[1] as Extract<
          AgentShellInputEventInput["event"],
          { kind: "key-down" | "key-up" }
        >["key"],
        modifiers: parseViewerControlKeyboardModifiers(tokens[2])
      };
    default:
      throw new Error("Unknown viewer control input command");
  }
}

function parseViewerControlPointerCoordinate(raw: string | undefined): number {
  return parseViewerControlExactNumber(raw, 0, 1);
}

function parseViewerControlPointerDelta(raw: string | undefined): number {
  const value = parseViewerControlExactNumber(raw, -4096, 4096);
  if (!Number.isInteger(value)) {
    throw new Error("Pointer wheel delta must be an integer");
  }

  return value;
}

function parseViewerControlExactNumber(raw: string | undefined, min: number, max: number): number {
  if (raw === undefined) {
    throw new Error("Missing numeric input");
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max || String(value) !== raw) {
    throw new Error("Invalid numeric input");
  }

  return value;
}

function parseViewerControlPointerButton(raw: string | undefined): Extract<
  AgentShellInputEventInput["event"],
  { kind: "pointer-down" | "pointer-up" }
>["button"] {
  if (raw && VIEWER_CONTROL_POINTER_BUTTONS.has(raw)) {
    return raw as Extract<
      AgentShellInputEventInput["event"],
      { kind: "pointer-down" | "pointer-up" }
    >["button"];
  }

  throw new Error("Invalid pointer button");
}

function parseViewerControlKeyboardModifiers(raw: string | undefined): Extract<
  AgentShellInputEventInput["event"],
  { kind: "key-down" | "key-up" }
>["modifiers"] {
  if (raw === undefined) {
    return [];
  }

  const modifiers = raw.split(",");
  if (
    modifiers.length === 0 ||
    modifiers.some((modifier) => !VIEWER_CONTROL_KEYBOARD_MODIFIERS.has(modifier)) ||
    new Set(modifiers).size !== modifiers.length
  ) {
    throw new Error("Invalid keyboard modifiers");
  }

  return modifiers as Extract<
    AgentShellInputEventInput["event"],
    { kind: "key-down" | "key-up" }
  >["modifiers"];
}

function validateViewerControlInputEvent(event: AgentShellInputEventInput["event"]): void {
  const parsed = parseProtocolEnvelope({
    ...createMessageBase("demo"),
    type: "input-event",
    authorizationId: VIEWER_CONTROL_VALIDATION_AUTHORIZATION_ID,
    fromPeerId: VIEWER_CONTROL_VALIDATION_FROM_PEER_ID,
    eventId: VIEWER_CONTROL_VALIDATION_EVENT_ID,
    sequence: 0,
    occurredAt: new Date(0).toISOString(),
    event
  });

  if (parsed.type !== "input-event") {
    throw new Error("Invalid viewer control input event");
  }
}

function isReadyViewerInputStatus(
  status: AgentShellViewerStatusSnapshot
): status is AgentShellViewerStatusSnapshot & { authorizationId: string } {
  return (
    status.state === "active" &&
    status.visibleToHost &&
    status.authorizationStatus === "active" &&
    typeof status.authorizationId === "string"
  );
}

function createViewerControlInputEventId(sequence: number): string {
  return `${VIEWER_CONTROL_INPUT_EVENT_ID_PREFIX}_${sequence}`;
}
