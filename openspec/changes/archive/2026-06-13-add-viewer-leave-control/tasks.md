## 1. OpenSpec

- [x] 1.1 Validate `add-viewer-leave-control` strictly before implementation.

## 2. Implementation

- [x] 2.1 Add managed runtime `leave()` as viewer-only local shutdown control.
- [x] 2.2 Route scheduled viewer disconnect and viewer control prompt disconnect through `leave()`.

## 3. Tests and Docs

- [x] 3.1 Add runtime integration coverage for viewer leave success, inactive status after leave, and host-role rejection.
- [x] 3.2 Update focused helper tests for `leave()` usage and no host-control/public-send behavior.
- [x] 3.3 Document managed viewer leave behavior and safety boundaries.

## 4. Verification

- [x] 4.1 Run focused agent-shell tests for viewer leave behavior.
- [x] 4.2 Review the diff against local-disconnect, no-forged-message, status, and no-remote-action safety boundaries.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
