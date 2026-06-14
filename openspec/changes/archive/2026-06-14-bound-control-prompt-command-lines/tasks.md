## 1. Prompt Input Bound

- [x] 1.1 Add a shared finite maximum for interactive control prompt command line byte length.
- [x] 1.2 Reject overlong host control prompt lines before command parsing, status reads, runtime controls, or public sends.
- [x] 1.3 Reject overlong viewer control prompt lines before status reads, local leave, host controls, or public sends.

## 2. Tests

- [x] 2.1 Add focused host control prompt tests for oversized command rejection and secret-safe output.
- [x] 2.2 Add focused viewer control prompt tests for oversized command rejection and secret-safe output.
- [x] 2.3 Run focused control prompt tests.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for `bound-control-prompt-command-lines`.
- [x] 3.2 Perform security review for control prompt input bounds.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
