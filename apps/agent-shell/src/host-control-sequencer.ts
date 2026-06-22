import type { AgentShellEvent } from "./runtime.js";

export type HostControlPromptStartupOptions = Readonly<{
  hostControlPrompt: boolean;
  hostConsentPrompt: boolean;
}>;

export function shouldStartHostControlPromptImmediately(
  options: HostControlPromptStartupOptions
): boolean {
  return options.hostControlPrompt && !options.hostConsentPrompt;
}

export function shouldStartHostControlPromptAfterEvent(
  options: HostControlPromptStartupOptions,
  alreadyStarted: boolean,
  event: AgentShellEvent
): boolean {
  return (
    options.hostControlPrompt &&
    options.hostConsentPrompt &&
    !alreadyStarted &&
    event.direction === "indicator" &&
    event.role === "host" &&
    event.state === "active" &&
    event.visibleToHost
  );
}
