## 1. Command Filtering

- [x] 1.1 Add `--only` parser support with fixed target validation.
- [x] 1.2 Render bounded target-specific text blocks for relay, host, viewer, browser, and preflight.
- [x] 1.3 Keep `--only` incompatible with `--json` and `--preflight-only`.

## 2. Documentation And Tests

- [x] 2.1 Add command-kit tests for each filtered target and failure mode.
- [x] 2.2 Document filtered command output in README.

## 3. Verification

- [x] 3.1 Run focused command-kit tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 4. Review

- [x] 4.1 Review non-execution and safety invariants, then archive the change.
