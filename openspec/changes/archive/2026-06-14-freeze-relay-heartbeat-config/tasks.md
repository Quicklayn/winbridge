## 1. Implementation

- [x] 1.1 Return a fresh validated heartbeat config snapshot from `normalizeRelayHeartbeatConfig()`.
- [x] 1.2 Add focused tests proving caller mutation cannot affect normalized heartbeat settings.
- [x] 1.3 Add a runtime-level regression test for caller mutation after `createRelayRuntime({ heartbeat })`.

## 2. Verification

- [x] 2.1 Run focused relay heartbeat/runtime tests.
- [x] 2.2 Complete security review for the relay heartbeat diff.
- [x] 2.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.4 Sync the completed OpenSpec delta into main specs and archive the change.
