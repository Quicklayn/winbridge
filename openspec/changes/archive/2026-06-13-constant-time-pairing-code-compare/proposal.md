## Why

Pairing-code verification is a security-sensitive gate for joining a development relay session. The current salted-hash check is correct functionally, but a direct string comparison is weaker than a fixed-length constant-time comparison for secret-derived hashes.

## What Changes

- Compare stored and candidate pairing-code hashes with a fixed-length constant-time comparison after schema validation.
- Preserve the existing accept/reject behavior for valid, mismatched, expired, and consumed pairing tickets.
- Add tests proving successful consumption, mismatched denial, and malformed stored hash rejection remain secret-safe.
- Do not add remote access capabilities, capture, input, clipboard, file transfer, diagnostics, reconnect, native Windows APIs, installer behavior, startup behavior, services, persistence, token changes, or privilege behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `identity-pairing`: pairing-code verification must compare salted hashes using a constant-time comparison and remain non-authorizing on mismatch.

## Impact

- Affected protocol package: `packages/protocol/src/identity.ts` and focused tests.
- Relay pairing joins use the updated protocol helper transitively.
- Security impact: strengthens pairing credential verification without granting any new permission or changing host consent, visibility, revocation, authorization, or audit requirements.
- Touches security-sensitive pairing/relay join behavior; requires explicit security review before release.
