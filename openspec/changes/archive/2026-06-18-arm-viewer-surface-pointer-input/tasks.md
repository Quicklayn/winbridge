## 1. Specification

- [x] 1.1 Create proposal, design, and delta spec for explicit pointer arming.

## 2. Implementation

- [x] 2.1 Add a visible pointer arming control to the generated viewer local surface.
- [x] 2.2 Gate frame-scoped pointerdown, pointerup, pointermove, and wheel handlers on explicit arming and disarm on frame error.
- [x] 2.3 Suppress browser-native context menu and image drag defaults on the remote frame only.
- [x] 2.4 Update README and security/architecture docs for explicit pointer arming and frame-scoped browser-default suppression.
- [x] 2.5 Add focused tests for pointer arming UI, handler gating, and frame-scoped browser-default suppression.

## 3. Verification

- [x] 3.1 Run focused viewer local control surface tests.
- [x] 3.2 Run security review for browser pointer arming and frame-scoped default suppression impact.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
