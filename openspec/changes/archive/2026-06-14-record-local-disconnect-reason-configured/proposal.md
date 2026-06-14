## Why

Local host disconnect audit records currently prove that the host closed a visible session, but they do not distinguish a default close reason from an explicitly configured local close reason. Auditors can benefit from that bounded distinction without storing or exposing the private reason text.

## What Changes

- Add `reasonConfigured` boolean metadata to local `agent-shell.session.disconnected` audit details.
- Set `reasonConfigured=true` only when a host-local disconnect reason was explicitly configured for scheduled or direct local host disconnect.
- Preserve the existing rule that raw disconnect reason text is never written to audit records, protocol messages, logs, or local runtime events.
- No relay routing, reconnect, authorization, capture, input, clipboard, file-transfer, diagnostics collection, native Windows, installer, service, startup, token, or privilege behavior is introduced.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: record bounded local disconnect reason presence metadata in host workflow audit records while preserving raw reason redaction.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and focused runtime integration tests for local host disconnect audit persistence.
- Affected behavior: host-local development audit detail metadata for local disconnect only.
- Safety impact: improves audit observability without exposing private reason text or widening consent, visibility, revocation, capture, input, or networking behavior.
- Touch areas: audit detail metadata. This does not touch screen capture, input execution, relay routing, reconnect, authorization semantics, installer behavior, startup persistence, services, tokens, privilege elevation, Windows prompts, or native Windows APIs.
