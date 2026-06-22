## 1. Implementation

- [x] 1.1 Add root `mvp:ready` script entrypoint.
- [x] 1.2 Implement bounded readiness helper with text and JSON output.
- [x] 1.3 Keep `mvp:doctor` entrypoint checks aligned with `mvp:ready`.
- [x] 1.4 Document `mvp:ready` usage.

## 2. Tests

- [x] 2.1 Cover argument parsing and malformed flag rejection.
- [x] 2.2 Cover default readiness plan skips smoke.
- [x] 2.3 Cover explicit smoke inclusion.
- [x] 2.4 Cover JSON success and failure output without raw child output leakage.

## 3. Verification

- [x] 3.1 Run focused MVP ready and doctor tests.
- [x] 3.2 Run `npm run mvp:ready -- --json`.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm run openspec:validate`.
- [x] 3.5 Run strict OpenSpec validation for this change.
