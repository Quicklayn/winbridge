## 1. Specification

- [x] 1.1 Create proposal, design, and delta specs for preloaded frame refresh.

## 2. Implementation

- [x] 2.1 Preload replacement frames in the generated viewer local surface before swapping `frame.src`.
- [x] 2.2 Preserve ready displayed-frame state and pointer arming while replacement refreshes load.
- [x] 2.3 Keep first-load and no-frame failures not-ready with pointer arming disabled.
- [x] 2.4 Update README and security/architecture docs for preloaded frame refresh behavior.
- [x] 2.5 Add focused tests for preload markers, `frame=refreshing`, stale refresh guards, and pointer readiness semantics.

## 3. Verification

- [x] 3.1 Run focused viewer local control surface tests.
- [x] 3.2 Run security review for local surface preload and pointer gating impact.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
