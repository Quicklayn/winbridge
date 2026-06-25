## 1. Viewer Input Readiness UI

- [x] 1.1 Track sanitized viewer status readiness in the generated page.
- [x] 1.2 Disable pointer arming, modifier toggles, explicit key buttons, and manual send until both status and frame are ready.
- [x] 1.3 Keep disconnect available and leave server/runtime input gates unchanged.

## 2. Tests And Docs

- [x] 2.1 Add focused local surface tests for readiness-gated controls and safety boundaries.
- [x] 2.2 Document the UI readiness gate in README.

## 3. Verification

- [x] 3.1 Run focused viewer local control surface tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 4. Review

- [x] 4.1 Review UI/input safety invariants and archive the change.
