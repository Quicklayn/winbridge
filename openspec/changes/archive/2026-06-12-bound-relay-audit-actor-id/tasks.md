## 1. Implementation

- [x] 1.1 Add bounded relay audit actor id construction in `apps/relay/src/audit.ts`.
- [x] 1.2 Add relay audit unit tests for short peer ids and max-length peer ids.
- [x] 1.3 Add relay integration coverage proving a max-length peer id join emits a schema-valid audit record.
- [x] 1.4 Sync accepted requirements into `openspec/specs/audit-foundation/spec.md` and `openspec/specs/relay-runtime/spec.md`.

## 2. Verification

- [x] 2.1 Run focused relay audit and relay integration tests.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Complete focused security review for relay audit/logging behavior.
