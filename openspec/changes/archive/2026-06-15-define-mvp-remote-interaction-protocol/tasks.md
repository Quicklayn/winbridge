## 1. Protocol Contracts

- [x] 1.1 Add screen-frame and input-event envelope schemas to `packages/protocol`.
- [x] 1.2 Export the new envelope types through the existing protocol package entrypoint.
- [x] 1.3 Add protocol tests for accepted screen frames and input events.
- [x] 1.4 Add protocol tests for malformed authorization ids, oversized frame payloads, unsafe input metadata, unknown fixed fields, and immutable parsed snapshots.
- [x] 1.5 Add relay forwarding gates for screen-frame and input-event sender role, sender peer, recipient role, and target peer checks.
- [x] 1.6 Add relay integration tests for accepted remote interaction forwarding, wrong-role rejection, target rejection, and authorization-only audit metadata.

## 2. Documentation And Review

- [x] 2.1 Update architecture/security documentation to describe the MVP protocol boundary and non-goals.
- [x] 2.2 Run security review for capture/input protocol contracts.
- [x] 2.3 Validate the OpenSpec change in strict mode.

## 3. Verification

- [x] 3.1 Run focused protocol tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
