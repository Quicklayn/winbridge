## 1. Runtime Fail-Closed Hardening

- [x] 1.1 Guard interactive host consent provider failure diagnostics with a best-effort path.
- [x] 1.2 Ensure throwing diagnostic event callbacks cannot prevent provider failure from returning a non-approval result.
- [x] 1.3 Ensure throwing diagnostic loggers cannot prevent provider failure from returning a non-approval result.
- [x] 1.4 Preserve existing static approval, denial, active state, audit-before-send, and local disconnect behavior.

## 2. Regression Coverage

- [x] 2.1 Add coverage for provider failure plus throwing diagnostic callback/logger.
- [x] 2.2 Assert no authorization, lifecycle, signal, permission, control, or workflow audit messages are sent after contained provider failure.
- [x] 2.3 Assert diagnostics, logs, and events do not expose raw provider, callback, logger, viewer identity, reason, pairing, token, payload, credential, or remote-content text.

## 3. Documentation

- [x] 3.1 Update security documentation for best-effort interactive consent failure diagnostics.

## 4. Review and Verification

- [x] 4.1 Perform security review for host consent, diagnostics, and logging impact.
- [x] 4.2 Run focused agent-shell typecheck and integration tests.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.4 Archive the completed OpenSpec change after implementation and verification.
