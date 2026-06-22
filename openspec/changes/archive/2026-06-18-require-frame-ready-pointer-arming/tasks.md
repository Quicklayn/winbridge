## 1. Specification

- [x] 1.1 Create proposal, design, and delta spec for frame-ready pointer arming.

## 2. Implementation

- [x] 2.1 Track frame readiness in the generated viewer local surface.
- [x] 2.2 Disable and disarm pointer arming while the latest frame is loading or not ready.
- [x] 2.3 Gate frame-scoped browser pointer handlers on both pointer arming and frame readiness.
- [x] 2.4 Update README and security/architecture docs for frame-ready pointer arming.
- [x] 2.5 Add focused tests for frame-ready pointer arming state and handler guards.

## 3. Verification

- [x] 3.1 Run focused viewer local control surface tests.
- [x] 3.2 Run security review for frame-ready pointer arming impact.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
