## 1. Runtime

- [x] 1.1 Track remote peer disconnect state after received `peer-disconnected` messages.
- [x] 1.2 Suppress delayed host workflow simulation messages after peer disconnect.
- [x] 1.3 Log peer disconnect notices with secret-safe summary fields only.

## 2. Tests

- [x] 2.1 Add integration tests for viewer receiving host disconnect notices through agent shell runtime.
- [x] 2.2 Add integration tests proving host delayed workflow messages are suppressed after viewer disconnect.

## 3. Documentation

- [x] 3.1 Document agent shell peer disconnect state handling and safety boundaries.

## 4. Review And Verification

- [x] 4.1 Run security review for agent shell lifecycle/logging changes.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Archive the completed OpenSpec change and verify no active changes remain.
