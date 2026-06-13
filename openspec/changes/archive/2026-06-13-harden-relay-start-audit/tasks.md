## 1. Relay Lifecycle Implementation

- [x] 1.1 Add relay runtime start-state tracking so duplicate active `start()` calls are rejected before listener, log, or audit side effects.
- [x] 1.2 Move development-mode warning and `relay.start.development-mode` accepted audit emission after successful listener bind, with listener cleanup if that startup audit emission fails.

## 2. Tests and Documentation

- [x] 2.1 Add relay integration tests for successful development-mode start audit, failed bind without accepted start audit, startup audit failure cleanup, and duplicate active start rejection.
- [x] 2.2 Update architecture and security documentation to describe successful-bind startup audit ordering and duplicate active start rejection.

## 3. Review and Verification

- [x] 3.1 Perform a focused security review of relay startup, log, and audit behavior for secret safety and consent-first invariants.
- [x] 3.2 Run focused relay tests plus `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
