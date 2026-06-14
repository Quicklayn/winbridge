## 1. Runtime Containment

- [x] 1.1 Contain accepted inbound `received` runtime event callback failures before bounded summary logging and workflow handling.
- [x] 1.2 Add an authorization request regression test where the host diagnostic `received` event callback throws after observing the redacted event.

## 2. Verification

- [x] 2.1 Run the targeted agent-shell regression test for accepted inbound event callback containment.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Run `git diff --check`.

## 3. Security Review

- [x] 3.1 Review the diff for consent, visibility, authorization, audit, signal, secret redaction, startup, installer, service, privilege, capture, input, and host indicator boundary regressions.
