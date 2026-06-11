## Why

Agent shell workflow timers use JavaScript `setTimeout`, which has a signed 32-bit millisecond delay limit. Today CLI timer values are only checked as non-negative integers, so oversized values can overflow the runtime timer behavior and fire much earlier than the operator intended.

## What Changes

- Reject agent shell timer CLI values larger than the safe `setTimeout` delay bound before starting the runtime.
- Apply the bound to `--authorization-ttl-ms`, `--revoke-after-ms`, `--pause-after-ms`, `--resume-after-ms`, and `--terminate-after-ms`.
- Preserve omitted timer behavior and valid zero-delay simulation behavior.
- Document that development timer options must be exact integers in the safe timer range.
- Non-goals: no production scheduler, no native Windows UI, no capture/input implementation, no installer/startup/service behavior, and no authorization state-machine semantic changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: CLI validation rejects oversized workflow timer delay values before runtime startup.

## Impact

- Affected code: `apps/agent-shell/src/args.ts`, agent shell argument tests, README/security docs, and OpenSpec specs.
- Affected systems: development consent workflow simulation timing.
- Safety impact: prevents timer overflow from causing immediate or unintended pause/resume/revoke/terminate/expiration simulation messages.
- This change touches user-visible consent workflow timing and authorization simulation; it does not touch capture, input, installer, startup, services, tokens, logs, or privilege elevation.
