## Why

The agent shell's static viewer signal probe and host acknowledgement are already gated by active visible authorization, but their protocol payloads do not use the bounded `payload.kind` classifier supported by the shared protocol. Adding classifier metadata makes the development signal path easier to reason about for future UI and transport wiring without exposing raw payload contents.

## What Changes

- Add bounded top-level `payload.kind` metadata to the built-in viewer signal probe.
- Add bounded top-level `payload.kind` metadata to the built-in host signal probe acknowledgement.
- Keep probe and acknowledgement payloads static, redacted in events/logs, and gated by the existing active visible `screen:view` authorization checks.
- Do not add SDP, ICE candidates, media frames, input events, clipboard data, file transfer, diagnostics, reconnect, native Windows APIs, or new permissions.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: require built-in development signal probe and acknowledgement messages to include bounded non-secret `payload.kind` classifier metadata while preserving existing authorization, visibility, redaction, and revocation behavior.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and agent-shell integration tests.
- Affected docs/specs: agent-shell consent workflow spec and user-facing signaling documentation.
- Safety impact: touches signaling behavior only. It does not touch capture, input, authentication, relay routing, installer, startup, services, tokens, logs, privilege elevation, or native Windows APIs. Existing authorization, host visibility, revocation, disconnect, audit, and redaction gates remain authoritative.
