## 1. Relay URL Validation

- [x] 1.1 Reject full `--relay` URLs with unspecified connect-target hosts.
- [x] 1.2 Reject full `--relay` URLs with non-root paths.
- [x] 1.3 Keep diagnostics bounded without echoing unsafe relay URL input.

## 2. Tests And Docs

- [x] 2.1 Add focused command-kit tests for unsafe full relay URLs and valid root URLs.
- [x] 2.2 Update README relay command documentation for connect target versus bind host.

## 3. Verification

- [x] 3.1 Run focused command-kit tests.
- [x] 3.2 Run `npm run mvp:ready -- --json`.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 4. Review

- [x] 4.1 Review non-execution, consent, relay, token, and no-leak invariants before archiving.
