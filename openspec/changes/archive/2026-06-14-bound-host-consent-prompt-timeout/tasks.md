## 1. Timeout Guard

- [x] 1.1 Add a positive bounded scheduler timeout assertion for direct prompt timeout values.
- [x] 1.2 Apply the guard in `createInteractiveHostDecisionProvider()` when `timeoutMs` is supplied.
- [x] 1.3 Apply the guard in `promptForHostConsentDecision()` before prompt output, input listeners, or timers are created.

## 2. Tests

- [x] 2.1 Add focused prompt helper tests for malformed direct timeout values.
- [x] 2.2 Add focused provider factory tests for malformed direct timeout values.
- [x] 2.3 Run focused host consent prompt tests.

## 3. Verification

- [x] 3.1 Review the host consent timeout hardening for consent boundary, prompt output, host visibility, authorization decisions, runtime controls, protocol sends, audit evidence, and abuse-resistance impact.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the OpenSpec change after implementation is verified.
