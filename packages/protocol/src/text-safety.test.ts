import { describe, expect, it } from "vitest";
import {
  createPendingSessionAuthorization,
  denySessionAuthorization
} from "./authorization.js";
import { createAuditRecord } from "./audit.js";
import { createDeviceIdentity } from "./identity.js";
import { HelloMessageSchema } from "./messages.js";
import { hasAsciiControlCharacter, hasUnsafeTextFormatControl } from "./text-safety.js";

const baseTime = new Date("2026-06-14T00:00:00.000Z");
const asciiUnsafeText = "safe\nprivate-text";
const formatUnsafeText = "safe\u200bprivate-text";

function pendingAuthorization() {
  return createPendingSessionAuthorization({
    sessionId: "session-demo",
    hostPeerId: "host-1",
    viewerPeerId: "viewer-1",
    requestedPermissions: ["screen:view"],
    now: baseTime
  });
}

function helloMessage(capability: string) {
  return {
    protocolVersion: 1,
    messageId: "message-demo",
    sessionId: "session-demo",
    createdAt: baseTime.toISOString(),
    type: "hello",
    peerId: "host-1",
    role: "host",
    displayName: "Host",
    capabilities: [capability]
  };
}

function expectBoundedTextRejection(
  operation: () => void,
  expectedMessage: string,
  unsafeText: string
): void {
  let thrown: unknown;

  try {
    operation();
  } catch (error) {
    thrown = error;
  }

  expect(thrown, expectedMessage).toBeInstanceOf(Error);
  expect((thrown as Error).message, expectedMessage).toContain(expectedMessage);
  expect((thrown as Error).message, expectedMessage).not.toContain(unsafeText);
  expect((thrown as Error).message, expectedMessage).not.toContain("private-text");
}

describe("protocol text safety helpers", () => {
  it("detects ASCII control and Unicode formatting controls", () => {
    expect(hasAsciiControlCharacter("Safe metadata")).toBe(false);
    expect(hasUnsafeTextFormatControl("Safe metadata")).toBe(false);

    expect(hasAsciiControlCharacter(asciiUnsafeText)).toBe(true);
    expect(hasUnsafeTextFormatControl(asciiUnsafeText)).toBe(false);

    for (const unsafe of [
      "\u061c",
      "\u200b",
      "\u200c",
      "\u200d",
      "\u200e",
      "\u200f",
      "\u202a",
      "\u202e",
      "\u2060",
      "\u2066",
      "\u2069",
      "\ufeff"
    ]) {
      expect(hasUnsafeTextFormatControl(`safe${unsafe}metadata`), unsafe).toBe(true);
    }
  });

  it("rejects unsafe text through representative protocol schemas", () => {
    const cases = [
      {
        message: "Audit action must not contain ASCII control characters",
        unsafeText: asciiUnsafeText,
        operation: () =>
          createAuditRecord({
            actor: { type: "relay", id: "relay-dev" },
            action: asciiUnsafeText,
            outcome: "failed"
          })
      },
      {
        message: "Capability must not contain Unicode bidi or zero-width formatting controls",
        unsafeText: formatUnsafeText,
        operation: () => HelloMessageSchema.parse(helloMessage(formatUnsafeText))
      },
      {
        message: "Authorization reason must not contain ASCII control characters",
        unsafeText: asciiUnsafeText,
        operation: () =>
          denySessionAuthorization(pendingAuthorization(), {
            reason: asciiUnsafeText,
            now: baseTime
          })
      },
      {
        message: "Display name must not contain Unicode bidi or zero-width formatting controls",
        unsafeText: formatUnsafeText,
        operation: () => createDeviceIdentity({ displayName: formatUnsafeText })
      }
    ] as const;

    for (const { message, operation, unsafeText } of cases) {
      expectBoundedTextRejection(operation, message, unsafeText);
    }
  });

  it("preserves safe text behavior in representative protocol schemas", () => {
    expect(
      createAuditRecord({
        actor: { type: "relay", id: "relay-dev" },
        action: "relay.safe.action",
        outcome: "accepted"
      }).action
    ).toBe("relay.safe.action");
    expect(HelloMessageSchema.parse(helloMessage("screen-view")).capabilities).toEqual([
      "screen-view"
    ]);
    expect(
      denySessionAuthorization(pendingAuthorization(), {
        reason: "Host denied",
        now: baseTime
      }).reason
    ).toBe("Host denied");
    expect(createDeviceIdentity({ displayName: "Host Support" }).displayName).toBe(
      "Host Support"
    );
  });
});
