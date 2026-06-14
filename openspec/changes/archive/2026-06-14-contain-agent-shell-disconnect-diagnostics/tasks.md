## 1. Runtime Cleanup Hardening

- [x] 1.1 Add a guarded best-effort diagnostic path for local host disconnect audit failures.
- [x] 1.2 Ensure throwing diagnostic event callbacks cannot prevent local disconnected state, inactive indicator emission, or WebSocket close.
- [x] 1.3 Ensure throwing diagnostic loggers cannot prevent local disconnected state, inactive indicator emission, or WebSocket close.
- [x] 1.4 Preserve fail-closed audit behavior for non-disconnect host workflow protocol sends.

## 2. Regression Coverage

- [x] 2.1 Add scheduled local host disconnect coverage for audit failure plus throwing diagnostic callback/logger.
- [x] 2.2 Add direct local host disconnect coverage for audit failure plus throwing diagnostic callback/logger.
- [x] 2.3 Assert cleanup diagnostics and events do not expose raw audit, callback, logger, close reason, pairing, token, payload, credential, or remote-content text.

## 3. Documentation

- [x] 3.1 Update security documentation for best-effort local disconnect diagnostics.

## 4. Review and Verification

- [x] 4.1 Perform security review for host disconnect, audit, and logging impact.
- [x] 4.2 Run focused agent-shell typecheck and integration tests.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.4 Archive the completed OpenSpec change after implementation and verification.
