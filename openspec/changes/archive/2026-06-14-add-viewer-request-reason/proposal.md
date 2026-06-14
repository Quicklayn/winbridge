## Why

Explicit host consent is stronger when the host can see why a viewer is requesting access, not only who is asking and which permissions are requested. The protocol already has an optional `session-authorization-request.reason` field; the development agent shell should expose a safe viewer-provided path for it and show that context in the host consent prompt.

## What Changes

- Add viewer-only `--request-reason` CLI/runtime option for the development agent shell when a viewer permission request is present.
- Validate request reasons with the existing bounded, trimmed, control-character-free, format-control-free, secret-safe reason rules before relay connection.
- Include a valid request reason in outbound `session-authorization-request.reason`.
- Show the trusted request reason, or `unavailable`, in the interactive host consent prompt before `approve` or `deny`.
- Reject host-mode `--request-reason` and request reasons without requested permissions before runtime startup.
- No new remote access capability is added.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Adds viewer request-reason CLI/runtime handling and host prompt display requirements.

## Impact

- Affected code: `apps/agent-shell/src/args.ts`, `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/host-consent-prompt.ts`, and their tests.
- Affected docs/specs: `openspec/specs/agent-shell-consent-workflow/spec.md`, `README.md`, and the archived OpenSpec change.
- Safety impact: improves consent context while preserving explicit host approval, visible-session gating, revoke/disconnect/pause/terminate behavior, redaction, and fail-closed authorization checks.
- Touches auth/user-visible workflow and reason metadata validation. It does not touch capture, input, relay transport, installer, startup, services, logs beyond existing workflow records, native Windows APIs, tokens, or privilege elevation.
