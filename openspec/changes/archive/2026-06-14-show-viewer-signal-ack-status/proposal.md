## Why

The development signal probe can already receive a host acknowledgement, but viewer status has no bounded way to report that the consent-bound round trip completed. A read-only status bit helps future viewer UI wiring verify signaling readiness without exposing signal payloads or adding remote actions.

## What Changes

- Add optional viewer status metadata showing that a trusted host signal probe acknowledgement was received for the current active authorization.
- Render that metadata in the existing viewer status CLI/control status line when present.
- Clear or omit the metadata when the viewer has no current active visible signal authorization, after pause/revoke/termination/expiration/disconnect/local leave/socket close, or when the signal is untrusted or for a mismatched authorization.
- No screen capture, input, clipboard, file transfer, diagnostics access, reconnect, installer, service, startup, token, privilege, relay routing, or native Windows behavior is introduced.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: expose bounded viewer-side status metadata after a trusted host signal probe acknowledgement.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, viewer status formatting, focused viewer status tests, runtime integration tests, and local docs.
- Affected behavior: local-only viewer status metadata for an already-authorized development signaling round trip.
- Safety impact: improves observability while preserving consent, active visible authorization, signal redaction, and fail-closed signal gates.
- Touch areas: development signaling status and authorization-bound runtime state. This does not touch capture, input execution, relay routing, installer behavior, startup persistence, services, tokens, logs beyond bounded status output, privilege elevation, Windows prompts, or native Windows APIs.
