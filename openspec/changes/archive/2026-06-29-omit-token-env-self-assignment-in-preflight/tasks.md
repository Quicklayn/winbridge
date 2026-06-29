## 1. Implementation

- [x] 1.1 Update command-kit all-smoke preflight rendering to omit assignment when `--token-env WINBRIDGE_RELAY_SHARED_TOKEN` is selected.
- [x] 1.2 Update ready-helper token-env preflight JSON validation to accept the reviewed no-assignment form while preserving alternate-env assignment checks.

## 2. Tests

- [x] 2.1 Add command-kit tests for reviewed no-assignment preflight text output.
- [x] 2.2 Add command-kit JSON tests for reviewed no-assignment preflight output and alternate-env assignment preservation.
- [x] 2.3 Add ready-helper parser tests for no-assignment acceptance and drift rejection.

## 3. Verification

- [x] 3.1 Run targeted command-kit and ready-helper tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
