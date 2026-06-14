## 1. Protocol Validation

- [x] 1.1 Add optional top-level signal payload `kind` validation for bounded non-secret classifier metadata.
- [x] 1.2 Preserve existing signal payload redaction and authorization-id validation behavior.

## 2. Tests And Docs

- [x] 2.1 Add focused protocol tests for safe, malformed, oversized, non-string, and secret-bearing `payload.kind` values.
- [x] 2.2 Add relay/agent-shell coverage showing invalid kind payloads fail before forwarding or runtime received events.
- [x] 2.3 Update security/architecture documentation for bounded signal kind metadata.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for `bound-signal-payload-kind`.
- [x] 3.2 Perform security review for signal kind validation and relay/protocol impact.
- [x] 3.3 Run focused affected protocol, relay, and agent-shell tests.
- [x] 3.4 Run `npm run check`.
- [x] 3.5 Run `npm test`.
- [x] 3.6 Run `npm run build`.
- [x] 3.7 Run `npm run openspec:validate`.
