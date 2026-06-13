## 1. Spec Updates

- [x] 1.1 Update session authorization protocol requirements for control/format-control reason rejection.
- [x] 1.2 Update relay runtime requirements for secret-safe malformed protocol reason rejection.

## 2. Implementation

- [x] 2.1 Harden shared protocol reason validation.
- [x] 2.2 Update docs describing protocol and workflow reason constraints.

## 3. Regression Tests

- [x] 3.1 Add protocol schema tests for unsafe authorization protocol reasons.
- [x] 3.2 Add relay integration coverage proving malformed protocol reasons are rejected before forwarding and without raw reason leakage.

## 4. Verification And Review

- [x] 4.1 Run focused protocol and relay tests.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Complete security review for protocol/relay/log-adjacent reason handling and resolve findings.
- [x] 4.4 Sync implemented requirements into main specs.
- [x] 4.5 Archive the OpenSpec change after implementation and validation.
