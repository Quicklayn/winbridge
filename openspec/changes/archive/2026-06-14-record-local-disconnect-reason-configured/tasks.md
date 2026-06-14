## 1. Local Disconnect Audit Metadata

- [x] 1.1 Add bounded `reasonConfigured` boolean metadata to local host disconnect audit records.
- [x] 1.2 Set `reasonConfigured=true` for scheduled and direct local host disconnect when `hostDisconnectReason` is configured.
- [x] 1.3 Set `reasonConfigured=false` when local host disconnect uses the default reason.
- [x] 1.4 Preserve local cleanup behavior and raw reason redaction when disconnect audit persistence or diagnostics fail.

## 2. Tests

- [x] 2.1 Update focused runtime integration tests for scheduled local disconnect audit metadata.
- [x] 2.2 Update focused runtime integration tests for direct local disconnect audit metadata.
- [x] 2.3 Keep assertions that raw configured disconnect reason text is absent from audit records, logs, events, and protocol messages.
- [x] 2.4 Run focused affected runtime integration tests.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for `record-local-disconnect-reason-configured`.
- [x] 3.2 Perform security review for local disconnect audit metadata.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
