## 1. Implementation

- [x] 1.1 Add a live mismatched-Host probe to the MVP smoke surface guard step.
- [x] 1.2 Ensure failures map to the existing bounded `surface-guards-not-ready` reason.

## 2. Tests and Docs

- [x] 2.1 Add unit tests for accepted/rejected/malformed Host guard probe outcomes.
- [x] 2.2 Add unit coverage proving the aggregate surface guard step invokes the Host guard.
- [x] 2.3 Update security/readiness documentation for Host guard smoke coverage.
- [x] 2.4 Add a security review note for the verification-only change.

## 3. Verification

- [x] 3.1 Run `npm run check`.
- [x] 3.2 Run `npm test`.
- [x] 3.3 Run `npm run build`.
- [x] 3.4 Run `npm run openspec:validate`.
