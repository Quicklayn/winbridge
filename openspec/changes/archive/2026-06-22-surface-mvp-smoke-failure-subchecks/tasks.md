## 1. Smoke Failure Metadata

- [x] 1.1 Add bounded failure subcheck metadata for known smoke step reasons.
- [x] 1.2 Keep unknown, usage, startup, and interrupted failures limited to the existing safe reason behavior.

## 2. Tests

- [x] 2.1 Cover failure subcheck ordering for a representative known step failure.
- [x] 2.2 Cover startup or unknown failures so they do not emit speculative subcheck metadata or raw details.

## 3. Verification

- [x] 3.1 Run the focused smoke script tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
