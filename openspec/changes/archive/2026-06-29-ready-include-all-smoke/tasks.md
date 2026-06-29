## 1. Readiness Flag

- [x] 1.1 Add `--include-all-smoke` usage text, parsing, duplicate rejection,
  overlap rejection, and role-mode rejection.
- [x] 1.2 Expand all-smoke readiness into the existing `smoke`, `lan-smoke`,
  `token-smoke`, and `lan-token-smoke` plan steps.
- [x] 1.3 Preserve default skipped smoke metadata and existing bounded smoke
  JSON parsing/formatting.
- [x] 1.4 Prevent non-token smoke children from inheriting ambient
  `WINBRIDGE_RELAY_SHARED_TOKEN`.

## 2. Tests And Docs

- [x] 2.1 Add focused ready/smoke tests for parsing, overlap rejection, plan
  shape, all-smoke success, failure redaction, default skipped metadata, and
  ambient token isolation.
- [x] 2.2 Update README with the explicit all-smoke readiness workflow.
- [x] 2.3 Run security review for token/relay readiness diagnostic boundaries.

## 3. Verification

- [x] 3.1 Run focused ready tests, real all-smoke ready command,
  `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
