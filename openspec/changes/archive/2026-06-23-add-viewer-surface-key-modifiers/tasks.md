## 1. Viewer Surface

- [x] 1.1 Add fixed visible modifier toggles to the local viewer surface HTML.
- [x] 1.2 Apply selected modifiers only to explicit keyboard button commands and clear them after one attempted key press.
- [x] 1.3 Keep modifier toggles disabled until a frame is ready and never send modifier-only input.

## 2. Tests

- [x] 2.1 Add focused local surface tests for modifier rendering, no global keyboard capture, one-shot reset, and metadata-only responses.
- [x] 2.2 Run focused viewer local control surface tests.
- [x] 2.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 3. Review

- [x] 3.1 Review the diff for input-safety invariants before archiving the change.
