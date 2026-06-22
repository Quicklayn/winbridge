## 1. Implementation

- [x] 1.1 Add explicit keyboard buttons to the generated viewer local surface HTML.
- [x] 1.2 Route each keyboard button click through existing token-protected `/input` key-down/key-up commands.
- [x] 1.3 Keep the surface free of document-level keyboard capture, text buffering, and macro behavior.

## 2. Tests And Docs

- [x] 2.1 Add focused local surface tests for keyboard button HTML and keyboard command routing.
- [x] 2.2 Update user-facing docs for explicit keyboard buttons and non-keylogging scope.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the change.
- [x] 3.2 Run focused viewer local surface tests.
- [x] 3.3 Perform input-safety review of the diff.
- [x] 3.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
