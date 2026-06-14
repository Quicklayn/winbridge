## 1. Host Status Metadata

- [x] 1.1 Add optional `remoteDisconnectReasonCode` to host status snapshots only when inactive cause is trusted `peer-disconnected`.
- [x] 1.2 Render optional `remoteDisconnectReasonCode` in host status and host control status output.
- [x] 1.3 Keep local disconnect, socket close, runtime stop, and terminal inactive host status from retaining stale remote disconnect reason metadata.

## 2. Tests

- [x] 2.1 Update focused host status and host control prompt formatter tests for remote disconnect reason metadata.
- [x] 2.2 Update runtime integration tests for trusted viewer disconnect inclusion and local disconnect omission.
- [x] 2.3 Run focused affected agent-shell tests.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for `show-host-remote-disconnect-reason-status`.
- [x] 3.2 Perform security review for host status disconnect metadata.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
