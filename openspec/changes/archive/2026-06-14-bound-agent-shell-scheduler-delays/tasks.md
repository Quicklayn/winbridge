## 1. Scheduler Delay Guard

- [x] 1.1 Add a shared agent-shell direct scheduler delay guard for finite integer delays from `0` through the safe timer delay bound.
- [x] 1.2 Apply the guard before `setTimeout()` in host status print scheduling.
- [x] 1.3 Apply the guard before `setTimeout()` in viewer status print scheduling.
- [x] 1.4 Apply the guard before `setTimeout()` in viewer local disconnect scheduling.

## 2. Tests

- [x] 2.1 Add focused host status scheduler tests for malformed direct delays.
- [x] 2.2 Add focused viewer status scheduler tests for malformed direct delays.
- [x] 2.3 Add focused viewer local disconnect scheduler tests for malformed direct delays.
- [x] 2.4 Run focused scheduler tests.

## 3. Verification

- [x] 3.1 Review the scheduler delay hardening for consent boundary, host visibility, local leave, runtime controls, protocol sends, audit evidence, and abuse-resistance impact.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the OpenSpec change after implementation is verified.
