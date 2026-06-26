## 1. Smoke Guard Implementation

- [x] 1.1 Add fixed viewer surface guard probes for missing token, foreign origin, and unsafe content type.
- [x] 1.2 Add a bounded `surface-guards` smoke subcheck and safe failure reason.
- [x] 1.3 Keep smoke output free of mutation tokens, origins, URLs, ports, response bodies, child output, and raw commands.

## 2. Tests And Docs

- [x] 2.1 Add focused smoke helper unit tests for accepted guard denials and failure cases.
- [x] 2.2 Update README smoke documentation to mention local surface guard verification.

## 3. Verification

- [x] 3.1 Run focused smoke tests.
- [x] 3.2 Run `npm run mvp:smoke -- --json`.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 4. Security Review

- [x] 4.1 Review consent, visibility, input, token, and no-leak invariants before archiving.
