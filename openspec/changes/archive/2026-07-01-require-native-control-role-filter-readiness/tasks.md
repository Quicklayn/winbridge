## 1. Role-Filter Readiness

- [x] 1.1 Add reviewed native control host/viewer markers to
      role-filter readiness parsing.
- [x] 1.2 Ensure default, LAN, and token-env host/viewer role-filter checks
      inherit the stronger validation without changing preflight-only output.

## 2. Tests and Documentation

- [x] 2.1 Add focused tests for accepted host/viewer role-filter native control
      markers.
- [x] 2.2 Add fail-closed tests for omitted or changed host input, host Windows
      capture, viewer request, and viewer frame-output markers in role-filter
      output.
- [x] 2.3 Update README readiness guidance.

## 3. Security Review

- [x] 3.1 Review capture/input role-filter readiness diff for consent,
      visibility, revocation, audit, non-execution, and diagnostic redaction
      impact.

## 4. Verification

- [x] 4.1 Run focused readiness tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
