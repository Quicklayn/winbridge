## 1. Command Kit

- [x] 1.1 Add bounded `--host-consent-timeout-ms` parsing with default `60000`.
- [x] 1.2 Render the host consent timeout in full-session and host-filter command output.
- [x] 1.3 Keep command kit failures bounded and non-executing for malformed timeout values.

## 2. Ready Integration

- [x] 2.1 Extend command-plan validation to require the reviewed host consent timeout.
- [x] 2.2 Extend role-filter and browser-plan validation to reject timeout drift.
- [x] 2.3 Keep readiness success and failure output free of command text and unsafe values.

## 3. Tests and Docs

- [x] 3.1 Add command-kit tests for default, custom, JSON, role-filter, and invalid timeout behavior.
- [x] 3.2 Add ready-helper tests for timeout validation and drift failure.
- [x] 3.3 Update README/OpenSpec-facing operator docs for the explicit host consent timeout.

## 4. Verification

- [x] 4.1 Run targeted command-kit and ready-helper tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
