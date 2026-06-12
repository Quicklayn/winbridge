## 1. Implementation

- [x] 1.1 Add strict parsing to fixed-shape protocol schemas in `packages/protocol/src/messages.ts`, preserving `signal.payload` and `audit-event.detail` containers.
- [x] 1.2 Add strict parsing to fixed-shape audit, identity, pairing, authorization, and session grant schemas in `packages/protocol/src/audit.ts`, `identity.ts`, `authorization.ts`, and `session.ts`.
- [x] 1.3 Add protocol unit tests proving unknown fixed fields are rejected and payload/detail metadata remains extensible.
- [x] 1.4 Add audit, identity, authorization, and grant unit tests for unknown fixed-field rejection.
- [x] 1.5 Add relay integration coverage proving unknown fixed fields are rejected before registration or forwarding with secret-safe audit metadata.
- [x] 1.6 Add agent-shell integration coverage proving unknown fixed fields are rejected before trusted received/sent events and socket writes.
- [x] 1.7 Sync accepted requirements into the main OpenSpec specs.

## 2. Verification

- [x] 2.1 Run focused protocol, relay, and agent-shell tests for strict fixed-field parsing.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Complete focused security review for protocol, auth, relay, and audit/logging behavior.
