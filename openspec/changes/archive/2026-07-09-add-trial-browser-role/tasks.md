## 1. Browser Trial Role

- [x] 1.1 Add `browser` to accepted `mvp:trial --role` values and usage text.
- [x] 1.2 Add a browser-only trial section that references viewer readiness and `mvp:commands -- --only browser`.
- [x] 1.3 Keep full text and JSON plans bounded, non-executing, and free of raw relay URLs, local URLs, pairing codes, token values, paths, frame bytes, and input contents.

## 2. Tests And Docs

- [x] 2.1 Add focused tests for parsing, full output, JSON output, browser-only output, relay-host substitution, and malformed role rejection.
- [x] 2.2 Update README `mvp:trial` role usage for the browser role.

## 3. Verification

- [x] 3.1 Run focused `mvp-trial` tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
