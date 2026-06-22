## 1. Implementation

- [x] 1.1 Add `mvp:ready` to text preflight command output.
- [x] 1.2 Add `mvp:ready` to JSON command plans.
- [x] 1.3 Preserve preflight-only exclusion of live-session commands.
- [x] 1.4 Update README command-kit wording.

## 2. Tests

- [x] 2.1 Cover full text output includes `mvp:ready`.
- [x] 2.2 Cover preflight-only text output includes `mvp:ready` and excludes live commands.
- [x] 2.3 Cover full JSON and preflight-only JSON include `preflight.ready`.

## 3. Verification

- [x] 3.1 Run focused MVP command-kit tests.
- [x] 3.2 Run `npm run mvp:commands -- --preflight-only`.
- [x] 3.3 Run `npm run mvp:commands -- --preflight-only --json`.
- [x] 3.4 Run `npm run check`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Run strict OpenSpec validation for this change.
