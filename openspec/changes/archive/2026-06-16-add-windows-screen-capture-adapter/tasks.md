## 1. Package And Adapter

- [x] 1.1 Add `packages/windows-capture` workspace package, TypeScript config, exports, and root project reference.
- [x] 1.2 Define public capture types, grant validation, bounded frame output, and safe error messages.
- [x] 1.3 Implement the default Windows PowerShell capture runner without native side effects at import or construction time.
- [x] 1.4 Ensure the adapter rejects non-Windows, inactive, invisible, missing-permission, disconnected, expired, malformed, oversized, and malformed-output cases before returning a frame.

## 2. Tests And Documentation

- [x] 2.1 Add unit tests with injected runners for valid capture output, grant denial cases, non-Windows rejection, runner failure, malformed output, and oversized payloads.
- [x] 2.2 Add tests proving diagnostics do not expose raw frame bytes, encoded frame data, screen contents, credentials, tokens, pairing codes, or command output.
- [x] 2.3 Update README/roadmap/threat model text to document the adapter boundary and non-goals.
- [x] 2.4 Run security review for native capture, grant validation, diagnostics, logs, service/startup/elevation non-goals, and OpenSpec impact.
- [x] 2.5 Validate the OpenSpec change in strict mode.

## 3. Verification

- [x] 3.1 Run focused windows-capture tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the completed OpenSpec change and re-run OpenSpec validation.
