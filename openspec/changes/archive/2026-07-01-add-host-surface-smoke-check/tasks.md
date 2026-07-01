## 1. Smoke Host Surface

- [x] 1.1 Start the MVP smoke host with `--host-control-surface-port 0`.
- [x] 1.2 Add safe host surface URL extraction and bounded status readiness checks.
- [x] 1.3 Add fixed host surface mutation guard probes for mismatched Host, missing token, foreign Origin, and unsafe content type.
- [x] 1.4 Add smoke success/failure output and JSON metadata for the fixed `host-surface` subcheck.

## 2. Ready Aggregation

- [x] 2.1 Update `mvp:ready` smoke parsing to require and report `host-surface`.
- [x] 2.2 Add readiness tests for accepted, missing, duplicate, and malformed `host-surface` smoke metadata.

## 3. Documentation and Review

- [x] 3.1 Update README smoke/readiness guidance for host surface verification.
- [x] 3.2 Perform a security review for consent, visibility, revocation, host-control mutation guards, token/log redaction, and cleanup behavior.

## 4. Verification

- [x] 4.1 Run focused smoke and readiness tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
