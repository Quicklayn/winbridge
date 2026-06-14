import { Readable, Writable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createInteractiveHostDecisionProvider,
  promptForHostConsentDecision
} from "./host-consent-prompt.js";
import { DEFAULT_HOST_CONSENT_TIMEOUT_MS } from "./runtime.js";

describe("interactive host consent prompt", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects malformed direct prompt timeouts before rendering prompt metadata", async () => {
    const malformedTimeouts = [
      0,
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      2_147_483_648
    ];

    for (const timeoutMs of malformedTimeouts) {
      const output = createCapturingOutput();

      await expect(
        promptForHostConsentDecision(
          {
            viewerPeerId: "viewer-1",
            viewerDisplayName: "Viewer Support",
            requestedPermissions: ["screen:view"],
            requestedPermissionCount: 1,
            requestReason: "Troubleshoot display settings"
          },
          { input: Readable.from(["approve\n"]), output, timeoutMs }
        )
      ).rejects.toThrow("Agent shell scheduler delay must be a positive bounded integer");
      expect(output.text()).toBe("");
    }
  });

  it("rejects malformed provider factory timeouts before creating a provider", () => {
    const malformedTimeouts = [
      0,
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      2_147_483_648
    ];

    for (const timeoutMs of malformedTimeouts) {
      expect(() => createInteractiveHostDecisionProvider({ timeoutMs })).toThrow(
        "Agent shell scheduler delay must be a positive bounded integer"
      );
    }
  });

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
        {
          viewerPeerId: "viewer-1",
          requestedPermissions: ["screen:view"],
          requestedPermissionCount: 1
        },
        { input: Readable.from([]), output }
      )
    ).resolves.toBe("none");
  });

  it("fails closed when the prompt times out", async () => {
    const input = new Readable({
      read() {
        // Keep the stream open so timeout, not EOF, closes the prompt.
      }
    });

    await expect(
      promptForHostConsentDecision(
        {
          viewerPeerId: "viewer-1",
          requestedPermissions: ["screen:view"],
          requestedPermissionCount: 1
        },
        { input, output: createCapturingOutput(), timeoutMs: 1 }
      )
    ).resolves.toBe("none");
  });

  it("fails closed with the default timeout when no timeout option is supplied", async () => {
    vi.useFakeTimers();
    const input = new Readable({
      read() {
        // Keep the stream open so the default timeout closes the prompt.
      }
    });

    const decision = promptForHostConsentDecision(
      {
        viewerPeerId: "viewer-1",
        requestedPermissions: ["screen:view"],
        requestedPermissionCount: 1
      },
      { input, output: createCapturingOutput() }
    );

    await vi.advanceTimersByTimeAsync(DEFAULT_HOST_CONSENT_TIMEOUT_MS);
    await expect(decision).resolves.toBe("none");
  });

  it("renders bounded viewer identity and permission metadata", async () => {
    const output = createCapturingOutput();

    await promptForHostConsentDecision(
      {
        viewerPeerId: "viewer-1",
        viewerDisplayName: "Viewer Support",
        viewerDeviceId: "dev_viewer_1",
        viewerDevicePlatform: "windows",
        viewerDeviceTrustLevel: "verified",
        requestedPermissions: ["screen:view", "input:pointer"],
        requestedPermissionCount: 2,
        requestReason: "Troubleshoot display settings"
      } as any,
      { input: Readable.from(["deny\n"]), output }
    );

    const renderedPrompt = output.text();
    expect(renderedPrompt).toContain("Viewer peer: viewer-1");
    expect(renderedPrompt).toContain("Viewer display name: Viewer Support");
    expect(renderedPrompt).toContain("Viewer device id: dev_viewer_1");
    expect(renderedPrompt).toContain("Viewer device platform: windows");
    expect(renderedPrompt).toContain("Requested permissions (2): screen:view,input:pointer");
    expect(renderedPrompt).toContain("Request reason: Troubleshoot display settings");
    expect(renderedPrompt).not.toContain("Viewer device trust");
    expect(renderedPrompt).not.toContain("verified");
    expect(renderedPrompt).not.toContain("123-456");
    expect(renderedPrompt).not.toContain("raw-token");
    expect(renderedPrompt).not.toContain("protocol-payload");
  });

  it("sanitizes unsafe direct helper metadata before rendering the prompt", async () => {
    const output = createCapturingOutput();

    await promptForHostConsentDecision(
      {
        viewerPeerId: "viewer-token-secret",
        viewerDisplayName: "Viewer token=raw-token",
        viewerDeviceId: "token-raw-device-id",
        viewerDevicePlatform: "windows\u202e",
        viewerDeviceTrustLevel: "credential-raw-trust",
        requestedPermissions: ["screen:view", "credential:read", "raw-token"],
        requestedPermissionCount: "raw-token",
        requestReason: "token=raw-token"
      } as any,
      { input: Readable.from(["deny\n"]), output }
    );

    const renderedPrompt = output.text();
    expect(renderedPrompt).toContain("Viewer peer: invalid");
    expect(renderedPrompt).toContain("Viewer display name: unavailable");
    expect(renderedPrompt).toContain("Viewer device id: unavailable");
    expect(renderedPrompt).toContain("Viewer device platform: unavailable");
    expect(renderedPrompt).toContain("Requested permissions (3): screen:view,invalid,invalid");
    expect(renderedPrompt).toContain("Request reason: unavailable");
    expect(renderedPrompt).not.toContain("viewer-token-secret");
    expect(renderedPrompt).not.toContain("Viewer token=raw-token");
    expect(renderedPrompt).not.toContain("token-raw-device-id");
    expect(renderedPrompt).not.toContain("credential-raw-trust");
    expect(renderedPrompt).not.toContain("credential:read");
    expect(renderedPrompt).not.toContain("raw-token");
    expect(renderedPrompt).not.toContain("token=raw-token");
  });

  it("renders an unavailable display-name fallback", async () => {
    const output = createCapturingOutput();

    await promptForHostConsentDecision(
      {
        viewerPeerId: "viewer-1",
        requestedPermissions: ["screen:view"],
        requestedPermissionCount: 1
      },
      { input: Readable.from(["deny\n"]), output }
    );

    const renderedPrompt = output.text();
    expect(renderedPrompt).toContain("Viewer peer: viewer-1");
    expect(renderedPrompt).toContain("Viewer display name: unavailable");
    expect(renderedPrompt).toContain("Viewer device id: unavailable");
    expect(renderedPrompt).toContain("Viewer device platform: unavailable");
    expect(renderedPrompt).toContain("Request reason: unavailable");
  });
});

function promptWithInput(input: string) {
  return promptForHostConsentDecision(
    {
      viewerPeerId: "viewer-1",
      viewerDisplayName: "Viewer Support",
      requestedPermissions: ["screen:view"],
      requestedPermissionCount: 1,
      requestReason: "Troubleshoot display settings"
    },
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
