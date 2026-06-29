## 1. Implementation

- [x] 1.1 Add default `mvp:ready` token-env browser role-filter validation.
- [x] 1.2 Add viewer-scoped `mvp:ready -- --role viewer` token-env browser role-filter validation.
- [x] 1.3 Add a browser-specific token-env role-filter parser.

## 2. Tests

- [x] 2.1 Add ready-plan tests for default and viewer-scoped token-env browser validation.
- [x] 2.2 Add readiness execution tests for passing token-env browser role-filter output.
- [x] 2.3 Add parser drift tests for missing, wrong, raw, or cross-target browser token output.

## 3. Verification

- [x] 3.1 Run targeted ready-helper tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
