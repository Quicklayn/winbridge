## 1. Status And Indicator Metadata

- [x] 1.1 Add optional `expiresAt` to host indicator events for active or paused visible authorization only.
- [x] 1.2 Add optional `expiresAt` to host and viewer status snapshots for active or paused visible authorization only.
- [x] 1.3 Render optional `expiresAt` in host and viewer status output.

## 2. Tests

- [x] 2.1 Update focused host/viewer status formatter and prompt tests for expiration metadata.
- [x] 2.2 Update runtime integration tests for active/paused expiration metadata and inactive omission.
- [x] 2.3 Run focused tests for affected agent-shell modules.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for `show-authorization-expiration-status`.
- [x] 3.2 Perform security review for auth/status/indicator changes.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
