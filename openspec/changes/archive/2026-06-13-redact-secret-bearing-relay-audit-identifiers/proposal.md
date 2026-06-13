## Why

Relay audit records use protocol identifiers for session attribution, peer actor attribution, device identity metadata, and forwarded-recipient metadata. Protocol identifiers are intentionally flexible enough to contain colon-separated operational names, so a malicious or careless peer can place secret-bearing strings such as `token:...`, `cookie:...`, or `sshKey:...` into otherwise schema-valid identifiers and have those strings copied into audit records.

## What Changes

- Redact secret-bearing relay audit identifiers before they are written to audit records.
- Apply the redaction to relay session attribution, relay peer actor attribution, join device identity audit metadata, join denial attribution, and forwarded recipient peer metadata.
- Preserve safe, schema-valid operational identifiers in existing readable audit fields.
- Keep redaction audit-only: it MUST NOT change room membership, pairing, forwarding, consent, authorization, capture, input, or reconnect behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audit-foundation`: Relay actor identifiers that contain secret-bearing metadata must be redacted instead of emitted in readable actor ids.
- `relay-runtime`: Relay audit detail and top-level session attribution must redact secret-bearing identifiers while preserving safe identifiers.

## Impact

- Affected code: `apps/relay/src/audit.ts`, `apps/relay/src/server.ts`, and relay integration tests.
- Affected specs: `audit-foundation` and `relay-runtime`.
- This change touches relay behavior, tokens, and logs.
- Safety impact: reduces audit leakage risk without adding remote access capability.
- Non-goals: no capture, input, hidden session, installer, startup, service, persistence, credential access, Windows prompt handling, or privilege elevation changes.
