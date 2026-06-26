## 1. Readiness Flag

- [x] 1.1 Add `--include-lan-token-smoke` parsing, duplicate rejection, usage
  text, and role-mode rejection.
- [x] 1.2 Wire the `lan-token-smoke` readiness plan step to
  `mvp:smoke -- --json --lan-relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
- [x] 1.3 Mark `lan-token-smoke` as skipped metadata by default and reuse the
  existing smoke JSON readiness parser.

## 2. Tests And Docs

- [x] 2.1 Add focused ready tests for parsing, plan shape, default skipped
  metadata, success, failure redaction, and role-mode rejection.
- [x] 2.2 Update README with the explicit LAN token smoke readiness workflow.
- [x] 2.3 Run security review for token/relay readiness diagnostic boundaries.

## 3. Verification

- [x] 3.1 Run focused ready tests, real LAN tokenized ready command,
  `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
