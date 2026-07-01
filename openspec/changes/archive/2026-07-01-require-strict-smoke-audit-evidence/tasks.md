## 1. Planning and Safety

- [x] 1.1 Validate the OpenSpec change strictly before implementation.
- [x] 1.2 Confirm the change remains local, explicit, metadata-only audit handling.

## 2. Smoke Audit Gate

- [x] 2.1 Add smoke-local and audit-summary role-bound required evidence mapping.
- [x] 2.2 Require strict smoke audit evidence before the audit subcheck passes.
- [x] 2.3 Keep smoke human and JSON audit summary output bounded and stable.

## 3. Tests and Docs

- [x] 3.1 Add tests for successful strict role-bound smoke audit summary.
- [x] 3.2 Add tests for wrong-role, missing disconnect, denied, or failed evidence.
- [x] 3.3 Update README and main OpenSpec spec with strict smoke audit evidence behavior.
- [x] 3.4 Run security review for audit/log output and strict smoke gate semantics.

## 4. Verification

- [x] 4.1 Run targeted smoke tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
