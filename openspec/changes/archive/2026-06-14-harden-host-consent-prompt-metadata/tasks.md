## 1. Prompt Metadata Hardening

- [x] 1.1 Add prompt-rendering validation for viewer peer id, viewer display name, requested permissions, and request reason.
- [x] 1.2 Render bounded placeholders for malformed required metadata and unavailable optional metadata without exposing raw unsafe values.

## 2. Tests

- [x] 2.1 Add focused host consent prompt tests for unsafe direct helper metadata rendering.
- [x] 2.2 Run focused host consent prompt tests.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for `harden-host-consent-prompt-metadata`.
- [x] 3.2 Perform security review for consent/auth prompt changes.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
