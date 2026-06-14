## 1. Runtime Containment

- [x] 1.1 Contain non-protocol inbound `raw` runtime event callback failures before bounded summary logging and return.
- [x] 1.2 Contain decoded unsafe inbound protocol `raw` runtime event callback failures before bounded summary logging and return.
- [x] 1.3 Add regression coverage for non-protocol inbound `raw` event callback failure.
- [x] 1.4 Add regression coverage for decoded unsafe inbound protocol `raw` event callback failure.

## 2. Verification

- [x] 2.1 Run the targeted agent-shell regression tests for unsafe inbound raw event callback containment.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Run `git diff --check`.

## 3. Security Review

- [x] 3.1 Review the diff for consent, visibility, authorization, audit, signal, secret redaction, startup, installer, service, privilege, capture, input, relay, protocol schema, public send, and host indicator boundary regressions.
