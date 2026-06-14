## 1. Runtime Payloads

- [x] 1.1 Add `payload.kind=viewer-signal-probe` to the built-in viewer signal probe payload.
- [x] 1.2 Add `payload.kind=host-signal-probe-ack` to the built-in host signal probe acknowledgement payload.
- [x] 1.3 Preserve existing marker, authorization id, recipient, and active visible `screen:view` signal gates.

## 2. Tests And Documentation

- [x] 2.1 Update agent-shell integration tests for probe and acknowledgement payload byte lengths and redaction.
- [x] 2.2 Add or update negative coverage proving `kind` alone does not make a probe acknowledgement trusted.
- [x] 2.3 Update README and architecture/security documentation for bounded probe kind metadata.

## 3. Verification

- [x] 3.1 Run focused agent-shell tests.
- [x] 3.2 Run strict OpenSpec validation for `classify-agent-signal-probes`.
- [x] 3.3 Run security review for signaling safety, redaction, and consent gates.
- [x] 3.4 Run `npm run check`.
- [x] 3.5 Run `npm test`.
- [x] 3.6 Run `npm run build`.
- [x] 3.7 Run `npm run openspec:validate`.
