## 1. Planning and Safety

- [x] 1.1 Validate the OpenSpec change strictly before implementation.
- [x] 1.2 Confirm the change remains explicit, local, and metadata-only.

## 2. Smoke Evidence Gate

- [x] 2.1 Require accepted audit outcome for the Windows input applied evidence.
- [x] 2.2 Keep denied, failed, malformed, missing, or wrong-action evidence on the bounded failure path.

## 3. Tests and Docs

- [x] 3.1 Add regression tests for accepted versus denied/failed input-applied audit evidence.
- [x] 3.2 Update README and main OpenSpec wording for accepted Windows input smoke evidence.
- [x] 3.3 Run security review for input/audit evidence semantics.

## 4. Verification

- [x] 4.1 Run targeted smoke tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
