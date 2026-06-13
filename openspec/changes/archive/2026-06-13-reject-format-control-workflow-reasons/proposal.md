## Why

Authorization lifecycle and agent-shell workflow reason text is stored in state and redacted audit/event paths. Current validation rejects blank, untrimmed, and oversized values, but still allows ASCII control characters and Unicode bidi or zero-width formatting controls that can make audit metadata misleading or visually ambiguous.

## What Changes

- Reject authorization lifecycle `reason` values that contain ASCII control characters or Unicode bidi/zero-width formatting controls, including `U+FEFF`.
- Reject agent-shell CLI and direct runtime workflow reason options with the same unsafe character classes before relay startup or workflow simulation.
- Keep malformed-reason diagnostics generic and secret-safe.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: Canonical authorization reasons also reject ASCII control and Unicode formatting controls.
- `agent-shell-consent-workflow`: CLI and direct runtime workflow reason validation also rejects ASCII control and Unicode formatting controls before startup.

## Impact

- Affected code: `packages/protocol/src/authorization.ts`, `apps/agent-shell/src/args.ts`, `apps/agent-shell/src/runtime.ts`.
- Affected tests: protocol authorization tests, agent-shell argument tests, and agent-shell runtime integration validation tests.
- Security surface: touches authorization metadata and log/audit-adjacent reason handling.
- Non-goals: no capture, input, clipboard, file transfer, relay routing, installer, startup, service, privilege elevation, persistence, or remote action implementation changes.
