## 1. Implementation

- [x] 1.1 Add runtime support for bounded interactive host consent provider resolution with a default timeout.
- [x] 1.2 Add timeout support to the built-in interactive readline prompt.
- [x] 1.3 Add CLI/runtime validation for `--host-consent-timeout-ms` / `hostConsentTimeoutMs`.
- [x] 1.4 Add unit and integration tests for prompt timeout, CLI validation, runtime validation, and fail-closed runtime behavior.
- [x] 1.5 Update README, security docs, architecture docs, and main OpenSpec specs.

## 2. Verification

- [x] 2.1 Run focused host-consent timeout tests.
- [x] 2.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.3 Complete security review for consent workflow changes.
