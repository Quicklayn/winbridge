## 1. Implementation

- [x] 1.1 Parse `--json` as a native preflight flag-only option.
- [x] 1.2 Emit bounded JSON readiness metadata when requested.
- [x] 1.3 Preserve existing text output and bounded errors.

## 2. Tests

- [x] 2.1 Cover JSON success output.
- [x] 2.2 Cover JSON failure output without raw PowerShell leakage.
- [x] 2.3 Cover malformed `--json` usage without raw value leakage.

## 3. Verification

- [x] 3.1 Run focused native preflight tests.
- [x] 3.2 Run `npm run mvp:native-preflight -- --json`.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm run openspec:validate`.
- [x] 3.5 Run strict OpenSpec validation for this change.
