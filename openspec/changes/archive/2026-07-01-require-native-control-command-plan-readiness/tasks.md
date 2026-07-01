## 1. Command-Plan Readiness

- [x] 1.1 Add reviewed native control command fragments to `mvp:ready`
      command-plan validation.
- [x] 1.2 Apply the validation to default, LAN, token, and ephemeral full
      session command-plan checks without affecting preflight-only checks.

## 2. Tests and Documentation

- [x] 2.1 Add focused tests for accepted reviewed native control markers.
- [x] 2.2 Add fail-closed tests for omitted, changed, or duplicated host input,
      host Windows capture, viewer request, and viewer frame-output markers.
- [x] 2.3 Update README readiness guidance.

## 3. Security Review

- [x] 3.1 Review capture/input readiness diff for consent, visibility,
      revocation, audit, non-execution, and diagnostic redaction impact.

## 4. Verification

- [x] 4.1 Run focused readiness tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
