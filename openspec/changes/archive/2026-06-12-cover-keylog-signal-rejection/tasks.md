## 1. Implementation

- [x] 1.1 Make the keylogging signal payload sensitive-key vocabulary explicit in `packages/protocol/src/messages.ts`.
- [x] 1.2 Add focused protocol tests for direct, decorated, nested, and array keylogging-related signal payload keys.
- [x] 1.3 Add relay integration coverage proving keylogging-related signal payloads are rejected before forwarding and omitted from audit records.
- [x] 1.4 Sync accepted requirements into `openspec/specs/session-broker/spec.md` and `openspec/specs/relay-runtime/spec.md`.

## 2. Verification

- [x] 2.1 Run focused protocol and relay tests.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Complete focused security review for signal payload and relay rejection behavior.
