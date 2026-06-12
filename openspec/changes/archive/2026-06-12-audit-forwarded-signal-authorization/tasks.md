## 1. Relay Audit Metadata

- [x] 1.1 Add a relay helper that builds accepted forward audit detail from the parsed protocol envelope.
- [x] 1.2 Include `authorizationId` only for accepted forwarded `signal` messages.
- [x] 1.3 Preserve existing accepted forward audit detail for non-signal messages.

## 2. Tests And Docs

- [x] 2.1 Add relay integration coverage proving accepted signal forward audit detail includes the signal `authorizationId`.
- [x] 2.2 Add relay integration coverage proving accepted signal forward audit detail omits raw signal payload contents.
- [x] 2.3 Update docs if operator-facing relay audit guidance needs to name forwarded signal authorization metadata.

## 3. Verification

- [x] 3.1 Run focused relay integration tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Run a security review for the relay audit/signaling metadata diff.
