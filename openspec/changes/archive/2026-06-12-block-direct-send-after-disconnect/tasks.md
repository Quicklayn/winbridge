# Tasks

## 1. Direct Send Disconnect Guard

- [x] 1.1 Block public `runtime.send()` calls after `peer-disconnected` is recorded.
- [x] 1.2 Ensure blocked post-disconnect direct sends emit no local `sent` event.

## 2. Tests and Documentation

- [x] 2.1 Add focused integration coverage for direct send suppression after peer disconnect.
- [x] 2.2 Update architecture, security, and main specs to document the direct-send disconnect guard.

## 3. Verification and Review

- [x] 3.1 Run focused agent-shell tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for the disconnect fail-closed runtime guard.
- [x] 3.4 Archive the completed OpenSpec change.
