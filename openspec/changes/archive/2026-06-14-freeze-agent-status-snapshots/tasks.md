## 1. Runtime Status Snapshots

- [x] 1.1 Freeze host status snapshots before returning them from `getHostStatus()`.
- [x] 1.2 Freeze viewer status snapshots before returning them from `getViewerStatus()`.

## 2. Tests

- [x] 2.1 Add host runtime status tests proving active and inactive snapshots are immutable and retain original visibility, permission count, authorization, inactive-cause, and disconnect metadata after mutation attempts.
- [x] 2.2 Add viewer runtime status tests proving active and inactive snapshots are immutable and retain original visibility, permission count, authorization, local inactive-cause, remote disconnect, and signal acknowledgement metadata after mutation attempts.

## 3. Review and Verification

- [x] 3.1 Review the status snapshot change for consent boundary, visibility, revocation, disconnect, audit-safety, and abuse-resistance impact.
- [x] 3.2 Run focused agent-shell runtime/status tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Sync and archive the OpenSpec change after implementation is verified.
