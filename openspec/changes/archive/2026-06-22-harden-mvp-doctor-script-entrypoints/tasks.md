## 1. Implementation

- [x] 1.1 Add required root MVP helper scripts to doctor static entrypoints.
- [x] 1.2 Preserve bounded `missing-entrypoint` diagnostics.

## 2. Tests

- [x] 2.1 Cover success when required helper scripts exist.
- [x] 2.2 Cover missing helper script failure without raw path leakage.
- [x] 2.3 Keep no-process/no-network/no-native-import source guard passing.

## 3. Verification

- [x] 3.1 Run focused doctor tests.
- [x] 3.2 Run `npm run mvp:doctor`.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Run strict OpenSpec validation for this change.
