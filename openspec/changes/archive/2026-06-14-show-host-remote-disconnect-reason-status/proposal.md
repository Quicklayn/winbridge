## Why

Viewer status already exposes the relay-defined `remoteDisconnectReasonCode` after a trusted host disconnect, but host status only reports `inactiveCause=peer-disconnected` after the viewer leaves. Host operators should be able to distinguish ordinary viewer close from heartbeat timeout using bounded metadata without seeing peer identity or raw close text.

## What Changes

- Add optional `remoteDisconnectReasonCode` metadata to host status snapshots when the host indicator is inactive because of a trusted remote viewer disconnect.
- Render that bounded reason code in host control prompt `status` output and scheduled host status CLI output when present.
- Keep local disconnect, socket close, runtime stop, terminal authorization, and pre-authorization inactive host status from carrying remote disconnect reason metadata.
- No relay routing, reconnect, authorization, capture, input, clipboard, file transfer, diagnostics collection, native Windows, installer, service, startup, token, or privilege behavior is introduced.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: expose bounded remote disconnect reason metadata in local host status surfaces after trusted remote viewer disconnect.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, host status formatters, host status/control tests, and focused runtime integration tests.
- Affected behavior: local-only host status metadata after a trusted remote viewer disconnect.
- Safety impact: improves local operator observability while preserving existing fail-closed disconnect handling and secret redaction.
- Touch areas: local status output, trusted peer disconnect lifecycle metadata. This does not touch screen capture, input execution, relay routing, reconnect, installer behavior, startup persistence, services, tokens, logs beyond bounded local status output, privilege elevation, Windows prompts, or native Windows APIs.
