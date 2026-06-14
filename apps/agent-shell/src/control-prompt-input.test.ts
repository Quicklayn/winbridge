import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import {
  isControlPromptCommandLineTooLong,
  MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES
} from "./control-prompt-input.js";

describe("control prompt input bounds", () => {
  it("uses a finite command line limit within the OpenSpec maximum", () => {
    expect(Number.isInteger(MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES)).toBe(true);
    expect(MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES).toBeGreaterThan(0);
    expect(MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES).toBeLessThanOrEqual(256);
  });

  it("accepts command lines at the byte limit and rejects lines above it", () => {
    const exactLimitLine = "x".repeat(MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES);
    const overLimitLine = `${exactLimitLine}x`;

    expect(Buffer.byteLength(exactLimitLine, "utf8")).toBe(
      MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES
    );
    expect(Buffer.byteLength(overLimitLine, "utf8")).toBe(
      MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES + 1
    );
    expect(isControlPromptCommandLineTooLong(exactLimitLine)).toBe(false);
    expect(isControlPromptCommandLineTooLong(overLimitLine)).toBe(true);
  });

  it("measures multi-byte UTF-8 command lines by bytes instead of code units", () => {
    const multiByteCharacter = "\u{044f}";
    const multiBytePrefix = multiByteCharacter.repeat(
      Math.floor(MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES / 2)
    );
    const multiBytePrefixBytes = Buffer.byteLength(multiBytePrefix, "utf8");
    const exactLimitLine =
      multiBytePrefixBytes === MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES
        ? multiBytePrefix
        : `${multiBytePrefix}x`;
    const overLimitLine = `${exactLimitLine}${multiByteCharacter}`;

    expect(exactLimitLine.length).toBeLessThan(MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES);
    expect(Buffer.byteLength(exactLimitLine, "utf8")).toBe(
      MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES
    );
    expect(Buffer.byteLength(overLimitLine, "utf8")).toBeGreaterThan(
      MAX_CONTROL_PROMPT_COMMAND_LINE_BYTES
    );
    expect(isControlPromptCommandLineTooLong(exactLimitLine)).toBe(false);
    expect(isControlPromptCommandLineTooLong(overLimitLine)).toBe(true);
  });
});
