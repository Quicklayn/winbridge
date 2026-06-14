## 1. Runtime Containment

- [x] 1.1 Emit `sent` runtime events through best-effort observer containment after successful socket writes.
- [x] 1.2 Preserve blocked public send behavior before socket write and before `sent` event emission.

## 2. Regression Coverage

- [x] 2.1 Add coverage that workflow-originated `sent` event callback failure does not emit runtime errors or block approved visible workflow delivery.
- [x] 2.2 Add coverage that public authorized `signal` send does not throw because of a `sent` event callback failure and still preserves redaction.
- [x] 2.3 Add coverage that blocked public sends still reject before `sent` event callback diagnostics.

## 3. Verification

- [x] 3.1 Run targeted agent-shell regression tests for sent event callback containment.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Run `git diff --check`.

## 4. Security Review

- [x] 4.1 Review the diff for consent, visibility, authorization, audit, signal, secret redaction, startup, installer, service, privilege, capture, input, relay, protocol schema, public send, and host indicator boundary regressions.
