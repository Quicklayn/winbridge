## 1. OpenSpec

- [x] 1.1 Validate `clarify-viewer-leave-status-metadata` strictly before implementation.

## 2. Tests and Docs

- [x] 2.1 Update viewer leave integration assertions to prove status omits authorization id/status metadata after local leave.
- [x] 2.2 Correct README, architecture, and security docs so remote host disconnect and local viewer leave status metadata are distinct.

## 3. Verification

- [x] 3.1 Run focused viewer leave runtime tests.
- [x] 3.2 Review the diff against metadata-clearing and no-remote-action safety boundaries.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
