## 1. Viewer Freshness UI

- [x] 1.1 Add client-side displayed-frame age tracking to the generated viewer surface.
- [x] 1.2 Render bounded fresh/stale frame status without exposing paths, URLs, bytes, tokens, authorization ids, or raw errors.
- [x] 1.3 Keep existing pointer arming, keyboard buttons, status polling, and disconnect behavior unchanged.

## 2. Tests And Docs

- [x] 2.1 Add focused local surface tests for freshness rendering and safety boundaries.
- [x] 2.2 Document the freshness indicator in README.

## 3. Verification

- [x] 3.1 Run focused viewer local control surface tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 4. Review

- [x] 4.1 Review UI/safety invariants and archive the change.
