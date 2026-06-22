## 1. Implementation

- [x] 1.1 Parse `--generate-pairing` as a flag-only command-kit option.
- [x] 1.2 Generate bounded `NNN-NNN` pairing codes for text output.
- [x] 1.3 Generate bounded pairing codes for JSON output.
- [x] 1.4 Reject conflicting or malformed pairing generation usage.

## 2. Tests

- [x] 2.1 Cover deterministic generated pairing in text output.
- [x] 2.2 Cover deterministic generated pairing in JSON output.
- [x] 2.3 Cover conflicts with explicit pairing and preflight-only mode.

## 3. Verification

- [x] 3.1 Run focused MVP command-kit tests.
- [x] 3.2 Run `npm run mvp:commands -- --generate-pairing`.
- [x] 3.3 Run `npm run mvp:commands -- --generate-pairing --json`.
- [x] 3.4 Run `npm run check`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Run strict OpenSpec validation for this change.
- [x] 3.7 Run `npm test`.
- [x] 3.8 Run `npm run build`.
