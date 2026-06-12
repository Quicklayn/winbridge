## 1. Protocol and Authorization Validation

- [x] 1.1 Require shared protocol workflow `reason` values to be already trimmed.
- [x] 1.2 Require shared authorization record and lifecycle transition `reason` values to be already trimmed.
- [x] 1.3 Add focused protocol and authorization tests for untrimmed reason rejection.

## 2. Agent-Shell Runtime Boundaries

- [x] 2.1 Reject untrimmed agent-shell CLI workflow reason options before runtime startup.
- [x] 2.2 Reject untrimmed direct managed runtime workflow reason options before relay connection or workflow sends.
- [x] 2.3 Add focused args and runtime tests proving rejected reasons do not create socket writes or trusted local events.

## 3. Specs, Docs, Verification, and Review

- [x] 3.1 Sync main OpenSpec specs and docs with canonical workflow reason requirements.
- [x] 3.2 Run focused protocol, agent-shell args, and agent-shell runtime tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Perform a security review of protocol/authorization metadata validation, agent-shell diagnostics, logging, and OpenSpec impact.
