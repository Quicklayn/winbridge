## 1. Runtime Containment

- [x] 1.1 Wrap the primary sanitized runtime error diagnostic event callback so callback failures are contained before bounded runtime logging.
- [x] 1.2 Add a direct host pause audit-failure regression test where the diagnostic event callback throws after observing the sanitized runtime error event.

## 2. Verification

- [x] 2.1 Run the targeted agent-shell regression test for runtime error event callback containment.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Run `git diff --check`.

## 3. Security Review

- [x] 3.1 Review the diff for consent, visibility, authorization, audit, signal, secret redaction, startup, installer, service, privilege, capture, and input boundary regressions.
