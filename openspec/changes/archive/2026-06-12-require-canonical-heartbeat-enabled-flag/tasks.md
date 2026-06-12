## 1. Heartbeat Enabled Flag Validation

- [x] 1.1 Reject untrimmed, blank, uppercase, and unknown `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` values before relay startup.
- [x] 1.2 Preserve omitted default-enabled behavior and canonical accepted values.

## 2. Tests

- [x] 2.1 Add relay heartbeat tests for canonical enabled flag values.
- [x] 2.2 Add relay heartbeat tests for malformed enabled flag values, including untrimmed values.
- [x] 2.3 Add relay runtime startup coverage for malformed heartbeat enabled environment.
- [x] 2.4 Run focused relay heartbeat and relay startup tests.

## 3. Specs, Docs, Verification, and Review

- [x] 3.1 Sync main relay heartbeat spec and docs with canonical enabled flag requirements.
- [x] 3.2 Run `npm run verify`.
- [x] 3.3 Perform a security review of heartbeat flag validation, startup behavior, peer acceptance, scheduling behavior, diagnostics, and OpenSpec impact.
