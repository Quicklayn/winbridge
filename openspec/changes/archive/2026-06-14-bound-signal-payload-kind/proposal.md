## Why

Signal payloads already require authorization-bound, redacted handling, and tests use a `kind` field as a signaling classifier. Making that optional classifier explicitly bounded and non-secret now gives future WebRTC/media work a safer metadata hook without exposing SDP, ICE candidates, or remote-content data.

## What Changes

- Reject `signal.payload.kind` when present but not a bounded, trimmed, non-secret protocol metadata string.
- Keep signal payloads redacted in runtime events, relay errors, logs, and audit output; this change does not expose `kind` as user-visible metadata.
- Preserve existing authorization, payload size, JSON compatibility, sensitive-key, relay routing, and runtime signal gates.
- No screen capture, input, clipboard, file transfer, diagnostics, reconnect, installer, startup, service, privilege, or native Windows behavior is introduced.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: require optional signal payload `kind` metadata to be bounded and non-secret before relay forwarding or agent processing.

## Impact

- Affected code: shared protocol signal validation and focused protocol/relay/agent tests that exercise signal payload validation.
- Affected behavior: schema-invalid signal payloads with malformed or secret-bearing `kind` metadata fail closed before forwarding, sending, receiving, or being treated as trusted signaling metadata.
- Safety impact: narrows a future signaling classifier to metadata-only values while preserving redaction and consent-bound authorization gates.
- Touch areas: protocol validation and signal handling. This touches relay/protocol security validation but does not touch capture, input execution, installer behavior, startup persistence, services, tokens, privilege elevation, native Windows APIs, or raw media transport.
