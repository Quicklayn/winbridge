## Why

Forwarded `signal` messages now require a top-level `authorizationId`, but accepted relay audit records still only name the message type. Recording the non-secret lifecycle authorization id in accepted signal audit metadata makes later consent and incident review traceable without storing raw signaling payloads.

## What Changes

- Add secret-safe audit detail for accepted forwarded `signal` messages that records the top-level payload `authorizationId`.
- Keep raw signal payload contents, SDP/candidates, markers, tokens, pairing codes, credentials, screenshots, keystrokes, clipboard data, file-transfer data, and diagnostics out of relay audit records.
- Add relay integration coverage proving accepted signal forwarding includes only the authorization id and safe routing/message metadata.
- Do not add relay-side active authorization enforcement, production identity, native screen capture, input injection, clipboard sync, file transfer, diagnostics capture, reconnect, installer behavior, services, startup persistence, privilege elevation, AV/EDR evasion, or Windows prompt bypass.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-runtime`: accepted forwarded signal audit metadata includes the non-secret signal authorization id while remaining payload-safe.

## Impact

- Affected code: `apps/relay/src/server.ts` and `apps/relay/src/server.integration.test.ts`.
- Affected specs/docs: relay runtime audit behavior and audit foundation guidance if docs need to name forwarded signal authorization metadata.
- Security impact: touches relay audit logs and signaling metadata. It strengthens traceability while preserving fail-closed consent boundaries and does not implement capture, input, stealth, credential access, persistence, AV/EDR evasion, Windows prompt bypass, or production authorization.
