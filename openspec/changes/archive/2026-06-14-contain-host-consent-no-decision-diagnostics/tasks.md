## 1. Runtime Implementation

- [x] 1.1 Route interactive host consent timeout diagnostics through a best-effort logger helper.
- [x] 1.2 Route interactive host consent invalid/no-accepted-decision diagnostics through the same best-effort helper.
- [x] 1.3 Preserve fail-closed no-approval behavior for timeout and invalid consent outcomes.

## 2. Tests

- [x] 2.1 Add integration coverage for invalid interactive consent diagnostic logger failure.
- [x] 2.2 Add integration coverage for timeout interactive consent diagnostic logger failure.
- [x] 2.3 Assert logger failures remain secret-safe, emit no runtime error, and send no authorization decision, authorization state, control, permission revoke, signal, or workflow audit messages.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell integration tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Perform security review for host consent no-decision diagnostic changes and confirm no capture, input, auth semantics, token, relay, installer, service, privilege, persistence, stealth, or consent-bypass behavior is introduced.
