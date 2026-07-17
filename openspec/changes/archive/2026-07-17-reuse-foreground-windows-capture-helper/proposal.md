## Why

The development Windows capture stream starts a new PowerShell process for
every authorized frame. A normal ten-minute MVP session can therefore create
hundreds of processes, and an in-flight one-shot capture has no shared native
lifecycle boundary that can be closed immediately when host authorization is
lost.

## What Changes

- Reuse one lazily started Windows screen-capture helper process for the
  current foreground host runtime instead of starting PowerShell for every
  frame.
- Serialize a bounded number of authorized capture requests with at most one
  native capture in flight, while retaining per-request grant validation and
  metadata-only audit-before-capture behavior.
- Close the helper and invalidate active or queued capture work when the host
  pauses, revokes any permission, terminates, expires, disconnects, loses the
  viewer or relay socket, replaces authorization, or stops the runtime.
- Revalidate current authorization after native success and before trusted
  capture-completed audit, screen-frame send, or local sent-event evidence.
- Fail closed on helper protocol, timeout, process, output, queue, and shutdown
  failures without exposing frame data, screen contents, or native diagnostics.
- Add package and runtime tests for process reuse, ordering, lifecycle races,
  restart only after a later active grant, output bounds, and redaction.
- Update development MVP documentation for the foreground helper lifecycle.

Safety impact: this change touches native Windows capture, authorization
lifecycle handling, and capture audit sequencing, so it requires a security
review. It does not add input, unattended access, background services, startup
persistence, privilege elevation, credential access, keylogging, clipboard or
file transfer, AV/EDR evasion, Windows security-prompt bypass, or hidden
capture.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `windows-screen-capture`: Require a bounded reusable foreground helper,
  ordered request execution, generic failure handling, and explicit shutdown.
- `agent-shell-consent-workflow`: Bind the capture helper lifetime to visible
  host authorization and prevent trusted capture evidence after lifecycle loss.

## Impact

- `packages/windows-capture`: adapter lifecycle, helper process protocol, and
  focused worker/queue tests.
- `apps/agent-shell`: one capture adapter instance per opted-in host runtime,
  authorization-loss shutdown hooks, post-success checks, and integration tests.
- `README.md` and OpenSpec requirements for the development MVP capture path.
- No protocol wire-format, relay, installer, service, account-authentication,
  token, input, clipboard, file-transfer, or privilege behavior is added.
