## 1. Audit Metadata

- [x] 1.1 Add `requestReasonProvided` boolean detail metadata to host authorization approval audit events.
- [x] 1.2 Add `requestReasonProvided` boolean detail metadata to host authorization denial audit events.
- [x] 1.3 Preserve raw request reason redaction from protocol audit details, local audit persistence, runtime events, logs, and status output.

## 2. Tests

- [x] 2.1 Add approval audit coverage for `requestReasonProvided=true` and raw reason absence from protocol/local audit records.
- [x] 2.2 Add denial audit coverage for `requestReasonProvided=true`, host `reasonConfigured`, and raw reason absence from protocol/local audit records.
- [x] 2.3 Add omitted request reason coverage proving `requestReasonProvided=false` for authorization decision audit events.
- [x] 2.4 Run focused agent-shell audit tests.

## 3. Verification and Review

- [x] 3.1 Validate the active OpenSpec change in strict mode.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for auth/audit metadata changes and confirm no consent, visibility, revoke, capture, input, relay, installer, startup, service, token, log, persistence, privilege elevation, hidden-session, or Windows prompt-bypass behavior was added or weakened.
- [x] 3.4 Sync accepted delta specs into `openspec/specs/`, archive the completed change, commit, and push.
