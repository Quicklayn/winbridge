## 1. OpenSpec

- [x] 1.1 Validate `show-viewer-status-disconnected` strictly before implementation.

## 2. Implementation

- [x] 2.1 Update viewer status snapshot logic to overlay trusted remote disconnect state as inactive local status.

## 3. Tests and Docs

- [x] 3.1 Add integration coverage for active viewer status becoming inactive after host disconnect while status reads remain message-free.
- [x] 3.2 Document viewer status behavior after trusted host disconnect.

## 4. Verification

- [x] 4.1 Run focused runtime integration tests for viewer status disconnect behavior.
- [x] 4.2 Review the diff against consent, visibility, revocation, audit redaction, and no-remote-action safety boundaries.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
