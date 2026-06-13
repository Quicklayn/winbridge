## Why

Interactive host consent is fail-closed for invalid input, cancellation, and provider errors, but a prompt can currently wait indefinitely. A stale unattended prompt weakens the development consent loop because an old request could be approved long after the operator context changed. Bounded prompt waiting keeps consent fresh and predictable without adding any remote-assistance capability.

## What Changes

- Add a bounded interactive host consent timeout for prompt-mode host decisions.
- Add CLI/runtime validation for `--host-consent-timeout-ms` / `hostConsentTimeoutMs`.
- Treat timeout as no accepted decision: do not send approval, denial, active state, lifecycle messages, signals, or workflow audit messages for that request.
- Keep timeout diagnostics secret-safe and metadata-only.
- Non-goals: no screen capture, input, clipboard, file transfer, reconnect, installer/service/startup behavior, privilege elevation, Windows prompt bypass, or production identity/authentication changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: interactive host consent prompt mode gets a bounded wait time and fail-closed timeout handling.

## Impact

- Affected areas: `apps/agent-shell`, tests, README, security/architecture docs, and OpenSpec specs.
- Touches user-visible workflow behavior and runtime/CLI option validation.
- Does not touch protocol schemas, relay forwarding, capture/input adapters, installer behavior, services, startup persistence, privilege elevation, or Windows security prompts.
