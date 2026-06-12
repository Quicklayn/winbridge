import { Readable, Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { promptForHostConsentDecision } from "./host-consent-prompt.js";

describe("interactive host consent prompt", () => {
  it("accepts exact approval and denial responses", async () => {
    await expect(promptWithInput("approve\n")).resolves.toBe("approve");
    await expect(promptWithInput("deny\n")).resolves.toBe("deny");
  });

  it("fails closed for invalid, blank, or cancelled responses", async () => {
    await expect(promptWithInput("Approve\n")).resolves.toBe("none");
    await expect(promptWithInput("   \n")).resolves.toBe("none");
    await expect(promptWithInput("allow\n")).resolves.toBe("none");
    await expect(promptWithInput(" approve\n")).resolves.toBe("none");
    await expect(promptWithInput("approve \n")).resolves.toBe("none");
    await expect(promptWithInput(" deny\n")).resolves.toBe("none");
    await expect(promptWithInput("deny \n")).resolves.toBe("none");

    const output = createCapturingOutput();
    await expect(
      promptForHostConsentDecision(
        { requestedPermissions: ["screen:view"], requestedPermissionCount: 1 },
        { input: Readable.from([]), output }
      )
    ).resolves.toBe("none");
  });

  it("renders only bounded permission metadata", async () => {
    const output = createCapturingOutput();

    await promptForHostConsentDecision(
      { requestedPermissions: ["screen:view", "input:pointer"], requestedPermissionCount: 2 },
      { input: Readable.from(["deny\n"]), output }
    );

    const renderedPrompt = output.text();
    expect(renderedPrompt).toContain("Requested permissions (2): screen:view,input:pointer");
    expect(renderedPrompt).not.toContain("123-456");
    expect(renderedPrompt).not.toContain("raw-token");
    expect(renderedPrompt).not.toContain("protocol-payload");
  });
});

function promptWithInput(input: string) {
  return promptForHostConsentDecision(
    { requestedPermissions: ["screen:view"], requestedPermissionCount: 1 },
    { input: Readable.from([input]), output: createCapturingOutput() }
  );
}

function createCapturingOutput(): Writable & { text(): string } {
  const chunks: Buffer[] = [];
  const output = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    }
  }) as Writable & { text(): string };

  output.text = () => Buffer.concat(chunks).toString("utf8");

  return output;
}
