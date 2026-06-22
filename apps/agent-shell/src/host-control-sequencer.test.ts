import { describe, expect, it } from "vitest";
import type { AgentShellEvent, AgentShellHostIndicatorEvent } from "./runtime.js";
import {
  shouldStartHostControlPromptAfterEvent,
  shouldStartHostControlPromptImmediately
} from "./host-control-sequencer.js";

describe("host control prompt sequencing", () => {
  it("starts immediately only when no interactive consent prompt owns stdin", () => {
    expect(
      shouldStartHostControlPromptImmediately({
        hostControlPrompt: true,
        hostConsentPrompt: false
      })
    ).toBe(true);
    expect(
      shouldStartHostControlPromptImmediately({
        hostControlPrompt: true,
        hostConsentPrompt: true
      })
    ).toBe(false);
    expect(
      shouldStartHostControlPromptImmediately({
        hostControlPrompt: false,
        hostConsentPrompt: false
      })
    ).toBe(false);
  });

  it("starts delayed controls after an active visible host indicator", () => {
    expect(
      shouldStartHostControlPromptAfterEvent(
        { hostControlPrompt: true, hostConsentPrompt: true },
        false,
        createHostIndicatorEvent({ state: "active", visibleToHost: true })
      )
    ).toBe(true);
  });

  it("does not start delayed controls after denial, timeout, invisible state, or repeat start", () => {
    const options = { hostControlPrompt: true, hostConsentPrompt: true };
    const nonIndicatorEvent = {
      direction: "sent",
      message: { type: "hello" }
    } as AgentShellEvent;

    expect(
      shouldStartHostControlPromptAfterEvent(
        options,
        false,
        createHostIndicatorEvent({ state: "inactive", visibleToHost: false })
      )
    ).toBe(false);
    expect(
      shouldStartHostControlPromptAfterEvent(
        options,
        false,
        createHostIndicatorEvent({ state: "active", visibleToHost: false })
      )
    ).toBe(false);
    expect(
      shouldStartHostControlPromptAfterEvent(
        options,
        true,
        createHostIndicatorEvent({ state: "active", visibleToHost: true })
      )
    ).toBe(false);
    expect(shouldStartHostControlPromptAfterEvent(options, false, nonIndicatorEvent)).toBe(false);
  });
});

function createHostIndicatorEvent(
  overrides: Partial<AgentShellHostIndicatorEvent> = {}
): AgentShellHostIndicatorEvent {
  return {
    direction: "indicator",
    role: "host",
    state: "active",
    authorizationId: "authz_sequencer_test",
    authorizationStatus: "active",
    visibleToHost: true,
    permissionCount: 1,
    cause: "activated",
    ...overrides
  };
}
