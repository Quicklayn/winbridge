import { Buffer } from "node:buffer";

export const MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES = 128;

export function isControlPromptCommandLineTooLong(line: string): boolean {
  return Buffer.byteLength(line, "utf8") > MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES;
}
