## 1. CLI Parser And Scheduler

- [x] 1.1 Add role-scoped CLI argument types and usage text for host development screen-frame scheduling.
- [x] 1.2 Add role-scoped CLI argument types and usage text for viewer development input-event scheduling.
- [x] 1.3 Add bounded validation for frame delay, frame id, format, dimensions, encoded frame data, and unsafe/secret-bearing frame inputs.
- [x] 1.4 Add bounded validation for input delay, input kind, pointer coordinates/buttons, keyboard key/code/modifiers, and unsafe/secret-bearing input inputs.
- [x] 1.5 Add CLI scheduler helpers that wait for active authorization and call `sendScreenFrame()` or `sendInputEvent()` exactly once.
- [x] 1.6 Wire scheduler handles into CLI startup and shutdown without adding native capture, rendering, OS input injection, reconnect, service, startup, or elevation behavior.

## 2. Tests And Documentation

- [x] 2.1 Add argument parser tests for valid host frame CLI configuration and invalid role/value cases.
- [x] 2.2 Add argument parser tests for valid viewer pointer/keyboard CLI configuration and invalid role/value cases.
- [x] 2.3 Add scheduler/runtime integration tests for authorized host CLI frame sends and viewer receipt with metadata-only audit/events.
- [x] 2.4 Add scheduler/runtime integration tests for authorized viewer CLI pointer and keyboard sends and host receipt with metadata-only audit/events.
- [x] 2.5 Add tests for missing, paused, revoked, expired, wrong-permission, wrong-role, malformed, and audit-failure CLI send rejection.
- [x] 2.6 Add tests proving CLI output, runtime events, logs, errors, and audit details do not expose raw frame bytes, screen contents, pointer details, key details, modifiers, or raw input payloads.
- [x] 2.7 Update README, architecture, and security documentation for the non-native remote interaction CLI boundary.
- [x] 2.8 Run security review for capture-boundary, input-boundary, auth, audit, diagnostics, and log changes.
- [x] 2.9 Validate the OpenSpec change in strict mode.

## 3. Verification

- [x] 3.1 Run focused agent-shell remote interaction CLI tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the completed OpenSpec change and re-run OpenSpec validation.
