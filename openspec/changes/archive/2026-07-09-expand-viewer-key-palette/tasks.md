## 1. Viewer Surface Key Palette

- [x] 1.1 Add fixed A-Z, 0-9, and Space key buttons to the viewer local control surface.
- [x] 1.2 Keep key buttons on the existing `sendKeyPress()` path with readiness gating and one-shot modifier clearing.

## 2. Tests And Docs

- [x] 2.1 Add focused tests for rendered key palette coverage, disabled-state wiring, and absence of global keyboard capture.
- [x] 2.2 Update README viewer surface documentation for the bounded key palette.
- [x] 2.3 Perform a scoped safety review for keyboard input UX, token handling, and no keylogging/global listener behavior.

## 3. Verification

- [x] 3.1 Run focused viewer local control surface tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
