## Why

Protocol envelope `sessionId` values are currently bounded as generic protocol identifiers, but most protocol message types do not reject secret-bearing marker metadata at the base envelope layer. A session id is reused for relay room lookup, forwarding, authorization workflow correlation, and audit attribution, so it should fail closed consistently instead of relying on per-message redaction.

## What Changes

- Reject every protocol envelope whose base `sessionId` contains secret-bearing protocol identifier metadata before parsing, encoding, relay forwarding, accepted-forward audit, or runtime trusted-event use.
- Keep diagnostics bounded so rejected `sessionId` values are not reflected in parser errors, peer-facing relay errors, runtime events, logs, or audit records.
- Align relay-runtime requirements that still describe audit-only redaction for secret-bearing join `sessionId` values with the current fail-closed identity/pairing policy.
- Preserve existing safe development ids such as `session-demo` and UUID-derived protocol metadata.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `protocol-identifiers`: add base protocol envelope `sessionId` rejection for secret-bearing metadata.
- `relay-runtime`: replace stale audit-only join `sessionId` redaction language with fail-closed behavior before registration, pairing side effects, room lookup, and accepted/denied join audit.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, `packages/protocol/src/messages.test.ts`, and relay integration coverage where protocol envelopes are parsed and forwarded.
- Affected specs: `openspec/specs/protocol-identifiers/spec.md` and `openspec/specs/relay-runtime/spec.md`.
- Safety impact: reduces accidental token, credential, pairing-code, authorization-header, cookie, private-key, SSH-key, or secret metadata propagation through protocol session identifiers.
- Non-goals: no capture, input, clipboard, file transfer, diagnostics exposure, installer, startup, service, persistence, privilege elevation, Windows prompt bypass, or authentication feature changes.
