## Why

Relay join-denial audit records currently identify the bounded denial reason and pairing classification but omit the validated attempted `sessionId` and `peerId`. That makes authorized support investigations weaker than accepted join audit records, while the relay can already include these non-secret identifiers safely.

## What Changes

- Add safe attempted session and peer attribution to `relay.peer.join.denied` audit records for decoded `join-session` denials, omitting raw identifiers and recording only redaction metadata when an attempted identifier contains the submitted pairing code.
- Preserve existing redaction for raw pairing codes, shared tokens, credentials, protocol payloads, screen contents, and other secrets.
- Add focused relay integration coverage for viewer-before-host and duplicate-peer denial attribution.
- Safety impact: improves auditability of denied pairing/join attempts without granting access, forwarding messages, changing consent, or exposing pairing material through raw identifiers.
- Non-goals: no protocol schema change, identity/account system, relay authorization expansion, token handling change, capture, input, clipboard, file transfer, installer, startup, service, privilege elevation, hidden sessions, or consent bypass.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `relay-runtime`: join-denial audit records for decoded `join-session` attempts include safe attempted session and peer attribution.

## Impact

- Affected code: `apps/relay/src/server.ts`.
- Affected tests: `apps/relay/src/server.integration.test.ts`.
- Affected specs: `openspec/specs/relay-runtime/spec.md`.
- Touched area: relay audit/log behavior.
- Not touched: protocol wire schema, agent shell runtime, native Windows code, capture, input, clipboard, file transfer, installer, startup, services, token parsing, or privilege elevation.
