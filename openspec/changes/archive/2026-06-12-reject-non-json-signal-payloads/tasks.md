## 1. Shared JSON Contract

- [x] 1.1 Extract shared JSON-compatible object/value validation from audit detail validation.
- [x] 1.2 Keep audit detail validation behavior unchanged while using the shared JSON-compatible object schema.

## 2. Signal Payload Enforcement

- [x] 2.1 Apply the shared JSON-compatible object schema to `SignalMessageSchema.payload`.
- [x] 2.2 Preserve existing signal `authorizationId`, non-empty, size, and sensitive-key checks.

## 3. Tests And Documentation

- [x] 3.1 Add protocol parse/encode tests for accepted JSON-compatible signal payloads and rejected non-JSON signal payloads.
- [x] 3.2 Add relay integration coverage proving non-JSON signal payloads are rejected before forwarding and audited safely.
- [x] 3.3 Update docs and OpenSpec main specs for the signal payload JSON-compatible contract.

## 4. Verification And Review

- [x] 4.1 Run focused protocol and relay tests for signal payload behavior.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
- [x] 4.6 Complete security review for the networking/relay change and address findings.
