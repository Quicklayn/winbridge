## Implementation

- [x] Update shared audit-log path validation to reject Windows alternate data stream path segments while preserving ordinary drive-prefix paths.
- [x] Update relay and agent-shell tests for stream-path rejection and safe drive-prefix acceptance.
- [x] Update project documentation and affected OpenSpec specs for the new audit-path validation contract.
- [x] Run focused tests for audit-log, relay audit configuration, and agent-shell argument parsing.

## Verification

- [x] Run `npm run check`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Run `npm run openspec:validate`.
- [x] Complete security review for log/audit behavior and confirm no remote capability, stealth, persistence, credential, capture, input, or privilege behavior was added.
