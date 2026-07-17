## 1. Reusable Windows Input Helper

- [x] 1.1 Add an injectable foreground worker boundary and bounded PowerShell line protocol that starts lazily and keeps native diagnostics private.
- [x] 1.2 Serialize adapter requests, revalidate grants before dispatch, invalidate queued work on close, restart only for a later valid grant, and close the one-shot convenience adapter.
- [x] 1.3 Add focused worker and adapter tests for reuse, FIFO ordering, expiry, close, restart, timeout/process/protocol failures, construction side effects, and redaction.

## 2. Agent Runtime Lifecycle Binding

- [x] 2.1 Own one Windows input adapter per opted-in host runtime and close it on pause, revoke, terminate, expiration, disconnect, socket close, authorization replacement, and runtime stop.
- [x] 2.2 Revalidate current authorization after adapter success before applied audit or trusted received-event emission.
- [x] 2.3 Add agent-shell integration tests for adapter reuse, lifecycle close races, stale success suppression, resume restart, and secret-safe failures.

## 3. Documentation And Verification

- [x] 3.1 Update README documentation for the foreground helper lifecycle and development-only scope.
- [x] 3.2 Run a security review of native input, authorization loss, process lifetime, audit ordering, and redaction paths; resolve blocking findings.
- [x] 3.3 Run focused Windows input and agent-shell tests.
- [x] 3.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.5 Run strict change validation and archive the completed OpenSpec change.
