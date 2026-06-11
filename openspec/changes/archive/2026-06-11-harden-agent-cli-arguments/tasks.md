## 1. Parser Refactor

- [x] 1.1 Move agent shell CLI parsing into a testable module without changing valid runtime defaults.
- [x] 1.2 Reject unknown, duplicate, malformed boolean, malformed permission, malformed pairing, and malformed integer arguments through bounded usage errors.

## 2. Tests

- [x] 2.1 Add focused parser tests for safe defaults, strict visible-session values, unknown option rejection, duplicate option rejection, and invalid permission rejection.
- [x] 2.2 Run focused agent-shell parser tests.

## 3. Verification

- [x] 3.1 Run security review for consent workflow CLI validation impact.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
