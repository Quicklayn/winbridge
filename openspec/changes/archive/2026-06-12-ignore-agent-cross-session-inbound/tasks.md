## 1. Implementation

- [x] 1.1 Add inbound session-id validation before agent-shell `received` events and workflow handling.
- [x] 1.2 Emit only redacted summary metadata for ignored cross-session protocol input.
- [x] 1.3 Update architecture/security docs and main OpenSpec specs for the inbound session boundary.

## 2. Verification

- [x] 2.1 Add focused agent-shell integration tests proving cross-session authorization requests are ignored.
- [x] 2.2 Add focused assertions that ignored cross-session input does not expose raw payloads or create `received` protocol events.
- [x] 2.3 Run focused agent-shell runtime tests.
- [x] 2.4 Complete security review for consent workflow/log/event behavior.
- [x] 2.5 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.6 Sync the completed OpenSpec delta into main specs and archive the change.
