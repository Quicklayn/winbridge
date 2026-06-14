## Why

Agent-shell host and viewer status snapshots are already specified as read-only, but runtime callers currently receive mutable objects. Freezing those snapshots makes local visibility and permission-count observations tamper-resistant at API boundaries.

## What Changes

- Return immutable host status snapshots from `getHostStatus()`.
- Return immutable viewer status snapshots from `getViewerStatus()`.
- Add regression tests proving callers cannot mutate status, visibility, permission-count, authorization, inactive-cause, disconnect, or signal-ack metadata in place.
- Preserve existing status output formatting, role boundaries, no-send behavior, and bounded metadata.
- Non-goal: add no capture, input, clipboard, file transfer, diagnostics payload, reconnect, hidden session, unattended access, installer, startup, service, credential, token, logging sink, or privilege-elevation capability.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: host and viewer status snapshots become immutable API results.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- The change touches local agent-shell status surfaces only. It does not touch relay transport, native Windows APIs, screen capture, remote input, installer behavior, startup behavior, services, tokens, credentials, privilege elevation, or production authorization.
