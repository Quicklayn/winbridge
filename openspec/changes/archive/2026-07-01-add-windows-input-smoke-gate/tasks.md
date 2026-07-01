## 1. Smoke Windows Input

- [x] 1.1 Add `--windows-input` parsing, usage text, and non-Windows fail-closed startup guard.
- [x] 1.2 Start the smoke host with `--host-apply-input true` only when `--windows-input` is explicit.
- [x] 1.3 Add fixed `windows-input` smoke check metadata from bounded host audit evidence.
- [x] 1.4 Keep default, LAN, token, LAN-token, and Windows capture smoke plans free of OS input.

## 2. Ready Aggregation

- [x] 2.1 Add `--include-windows-input-smoke` parsing, help text, and ready plan step.
- [x] 2.2 Update smoke JSON parsing to accept the fixed `windows-input` subcheck only for the explicit Windows input smoke step.
- [x] 2.3 Verify `--include-all-smoke` does not include Windows input smoke.

## 3. Documentation and Security Review

- [x] 3.1 Update README smoke/readiness guidance for explicit Windows input smoke.
- [x] 3.2 Perform a security review for consent, visible session state, revocation, audit evidence, native input opt-in, and diagnostic redaction.

## 4. Verification

- [x] 4.1 Run focused smoke and readiness tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
