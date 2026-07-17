## 1. Reusable Windows Capture Helper

- [x] 1.1 Add an injectable foreground capture worker with a static bounded line protocol, exact request validation, byte-bounded frame responses, and private native diagnostics.
- [x] 1.2 Add FIFO adapter serialization, acceptance/pre-dispatch/post-output grant validation, bounded queueing, generation invalidation, idempotent close, failure restart, and one-shot cleanup.
- [x] 1.3 Add focused worker and adapter tests for reuse, ordering, expiry, queue overflow, close, restart, timeout/process/protocol/output failures, construction side effects, and redaction.

## 2. Agent Runtime Capture Lifecycle

- [x] 2.1 Make the host runtime own one lazily used capture adapter, require persisted request audit before invocation, and locally block/close capture on pause, permission revoke, terminate, expiration, disconnect, socket close, authorization replacement, reset, and runtime stop.
- [x] 2.2 Require injected capture adapters to expose close, revalidate current screen authorization after success, block after post-capture evidence failure, and ensure helper close precedes visible indicator deactivation during runtime stop.
- [x] 2.3 Add agent-shell integration tests for adapter reuse, missing/failed audit, failed indicator activation, lifecycle close races, stale success suppression, post-capture evidence blocking, resume restart, and secret-safe failures.

## 3. Documentation And Verification

- [x] 3.1 Update README documentation for the reusable foreground capture helper lifecycle, bounds, and development-only scope.
- [x] 3.2 Run a security review of native capture, consent, visibility, authorization loss, process lifetime, audit ordering, output bounds, and redaction paths; resolve blocking findings.
- [x] 3.3 Run focused Windows capture and agent-shell tests.
- [x] 3.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.5 Run strict change validation, sync delta specs, and archive the completed OpenSpec change.
