## 1. Runtime Implementation

- [x] 1.1 Route delayed host workflow skip diagnostic logger output through the existing best-effort runtime logger helper after the no-send decision.
- [x] 1.2 Preserve existing disconnected-state checks, authorization lifecycle gates, audit persistence behavior, and protocol send ordering for real workflow actions.

## 2. Tests

- [x] 2.1 Add integration coverage for remote peer disconnect followed by delayed workflow skip logger failure.
- [x] 2.2 Add integration coverage for local host disconnect followed by delayed workflow skip logger failure.
- [x] 2.3 Assert logger failure remains secret-safe, emits no runtime error event, and does not send delayed lifecycle, control, permission, signal, disconnect, or workflow audit messages.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell integration tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Perform security review for host lifecycle/log diagnostic changes and confirm no capture, input, auth semantics, token, relay, installer, service, privilege, persistence, stealth, or consent-bypass behavior is introduced.
