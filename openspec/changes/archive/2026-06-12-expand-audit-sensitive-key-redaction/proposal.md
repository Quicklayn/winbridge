## Why

Audit detail redaction currently covers core keys such as token, credential, password, secret, pairing code, keystroke, screenshot, and screen data. Common secret-bearing names such as `apiKey`, `authorization`, `authHeader`, `cookie`, and `privateKey` can still pass through if a caller accidentally includes them in audit details.

## What Changes

- Expand audit detail sensitive-key detection to cover additional common authentication and browser/session secret names.
- Keep non-secret authorization identifiers, such as `authorizationId`, unredacted.
- Add focused tests proving nested and array-contained audit details redact the expanded key set.
- Update audit security documentation and OpenSpec requirements.
- Non-goals: no changes to audit record schema shape, audit sink interfaces, relay routing, authorization decisions, protocol messages, capture, input, clipboard, file transfer, installer, services, startup persistence, privilege elevation, or Windows prompt behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audit-foundation`: audit detail redaction recognizes a broader set of secret-bearing key names while preserving non-secret authorization identifiers.

## Impact

- Affected code: `packages/protocol/src/audit.ts` and focused audit tests.
- Affected docs: security model audit redaction notes.
- Affected API: no schema or sink interface changes; some additional audit detail fields will now be stored as `[REDACTED]`.
- Safety impact: strengthens audit/log secret handling only; does not add or expand remote assistance capability.
- Review gate: security review required because the change touches audit/log redaction behavior.
