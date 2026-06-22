## 1. Implementation

- [x] 1.1 Parse `--json` as a smoke flag-only option.
- [x] 1.2 Format bounded JSON success output.
- [x] 1.3 Format bounded JSON failure output.
- [x] 1.4 Preserve existing text output, cleanup, and side-effect behavior.

## 2. Tests

- [x] 2.1 Cover JSON success output without sensitive runtime metadata.
- [x] 2.2 Cover JSON failure output with safe reason code only.
- [x] 2.3 Cover malformed `--json` usage without raw value leakage.

## 3. Verification

- [x] 3.1 Run focused MVP smoke tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm run openspec:validate`.
- [x] 3.4 Run strict OpenSpec validation for this change.
