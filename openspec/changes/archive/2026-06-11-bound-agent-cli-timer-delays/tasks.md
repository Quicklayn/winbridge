## 1. Timer Delay Validation

- [x] 1.1 Add agent shell argument tests for valid maximum, zero, and oversized workflow timer delays.
- [x] 1.2 Implement a shared safe timer delay bound for `--authorization-ttl-ms`, `--revoke-after-ms`, `--pause-after-ms`, `--resume-after-ms`, and `--terminate-after-ms`.
- [x] 1.3 Update README and security documentation to describe exact bounded timer values.

## 2. Verification

- [x] 2.1 Run focused agent shell argument tests.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Run review for authorization workflow timer validation.
- [x] 2.7 Archive the OpenSpec change after implementation and verification are complete.
