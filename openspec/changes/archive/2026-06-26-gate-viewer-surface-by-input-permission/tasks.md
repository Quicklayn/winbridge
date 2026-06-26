## 1. Runtime Status Metadata

- [x] 1.1 Add metadata-only pointer and keyboard readiness to viewer status snapshots.
- [x] 1.2 Keep viewer status formatting and inactive status behavior bounded and backward compatible.

## 2. Local Surface UI Gates

- [x] 2.1 Sanitize local surface `/status` responses to explicit boolean input readiness metadata without authorization ids or permission arrays.
- [x] 2.2 Gate pointer arming and pointer handlers on pointer readiness.
- [x] 2.3 Gate keyboard buttons, modifier toggles, and manual send readiness on keyboard or matching input readiness.

## 3. Tests

- [x] 3.1 Add runtime or surface tests for screen-only grants keeping input controls unavailable.
- [x] 3.2 Add surface tests for pointer-only, keyboard-only, and full input readiness metadata and rendered gating logic.
- [x] 3.3 Run focused agent-shell viewer surface/runtime tests.

## 4. Verification And Review

- [x] 4.1 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.2 Review input, authorization, token, local surface, no-keylogging, and no-leak invariants before archiving.
