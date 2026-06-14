## 1. Runtime Implementation

- [x] 1.1 Route revoke skip diagnostics through a best-effort logger helper.
- [x] 1.2 Route pause and resume skip diagnostics through the same best-effort logger helper.
- [x] 1.3 Route terminate, expiration, and disconnect skip diagnostics through the same best-effort logger helper.
- [x] 1.4 Route resume-without-pause configuration diagnostics through the same best-effort logger helper.
- [x] 1.5 Preserve successful lifecycle action behavior and audit persistence gates.

## 2. Tests

- [x] 2.1 Add integration coverage for terminal lifecycle skip diagnostic logger failure after a prior termination.
- [x] 2.2 Add integration coverage for resume-without-pause configuration diagnostic logger failure after active authorization.
- [x] 2.3 Assert logger failures remain secret-safe, emit no runtime error, and do not send skipped lifecycle control/state/permission/audit messages.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell integration tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Perform security review for host lifecycle skip diagnostic changes and confirm no capture, input, auth semantics, token, relay, installer, service, privilege, persistence, stealth, or consent-bypass behavior is introduced.
