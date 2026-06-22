## 1. Implementation

- [x] 1.1 Parse `--keep-artifacts` as a flag-only smoke CLI option.
- [x] 1.2 Pass `keepArtifacts` into the smoke runner from the CLI.
- [x] 1.3 Print bounded retained artifact directory metadata on successful retained runs.
- [x] 1.4 Preserve cleanup-by-default behavior and bounded failure diagnostics.

## 2. Tests

- [x] 2.1 Cover default parsing with `keepArtifacts=false`.
- [x] 2.2 Cover `--keep-artifacts` parsing and malformed combinations.
- [x] 2.3 Cover retained success output without exposing frame bytes, mutation tokens, child output, tokens, or pairing codes.
- [x] 2.4 Keep existing smoke plan safety tests passing.

## 3. Verification

- [x] 3.1 Run focused smoke tests.
- [x] 3.2 Run `npm run mvp:smoke -- --keep-artifacts --timeout-ms 45000`.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Run strict OpenSpec validation for this change.
