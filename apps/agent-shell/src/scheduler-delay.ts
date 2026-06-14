const MAX_AGENT_SHELL_SCHEDULER_DELAY_MS = 2_147_483_647;
const AGENT_SHELL_SCHEDULER_DELAY_ERROR =
  "Agent shell scheduler delay must be a bounded integer";

export function assertAgentShellSchedulerDelayMs(delayMs: number): void {
  if (
    !Number.isInteger(delayMs) ||
    delayMs < 0 ||
    delayMs > MAX_AGENT_SHELL_SCHEDULER_DELAY_MS
  ) {
    throw new Error(AGENT_SHELL_SCHEDULER_DELAY_ERROR);
  }
}
