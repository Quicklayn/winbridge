## Why

The development Windows input path starts a new PowerShell process for every
authorized pointer or keyboard event. That startup cost prevents responsive
MVP control and concurrent inbound events do not have one explicit native
execution order.

## What Changes

- Reuse one lazily started Windows input helper process for the current
  foreground host runtime instead of starting PowerShell for every event.
- Serialize bounded authorized input requests through the helper and retain
  per-event grant validation plus pre-application and post-success audit gates.
- Abort queued or in-flight helper work and close the helper when the
  authorization is paused, revoked, terminated, expired, disconnected, or the
  runtime stops.
- Fail closed on helper protocol, timeout, process, output, and shutdown
  failures without exposing input contents or native diagnostics.
- Add package and agent-shell tests for process reuse, ordering, lifecycle
  shutdown, restart only after a later active grant, and redaction.
- Update the development documentation for the foreground helper lifecycle.

Safety impact: this change touches native Windows input, authorization
lifecycle handling, and input audit sequencing, so it requires a security
review. It does not add screen capture, unattended access, background services,
startup persistence, privilege elevation, credential access, keylogging,
AV/EDR evasion, or Windows security-prompt bypass.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `windows-input`: Require a bounded reusable foreground helper, ordered
  request execution, generic failure handling, and explicit shutdown.
- `agent-shell-consent-workflow`: Bind the helper lifetime to the visible host
  authorization and prevent trusted success after lifecycle loss.

## Impact

- `packages/windows-input`: adapter lifecycle, helper process protocol, and
  focused process/queue tests.
- `apps/agent-shell`: one adapter instance per runtime, authorization-loss
  shutdown hooks, and integration tests.
- `README.md` and OpenSpec requirements for the development MVP input path.
- No new production service, installer, relay, account-authentication, token,
  capture, clipboard, file-transfer, or privilege behavior.
