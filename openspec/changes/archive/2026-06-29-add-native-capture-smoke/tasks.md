## 1. Smoke CLI and Plan

- [x] 1.1 Add `--windows-capture` parsing and usage text for `mvp:smoke`.
- [x] 1.2 Add a fail-closed non-Windows guard before smoke child startup.
- [x] 1.3 Update smoke plan generation to use `windows-capture` host frame source without static frame payload arguments.

## 2. Ready Integration

- [x] 2.1 Add an explicit opt-in `mvp:ready` flag for native capture smoke validation.
- [x] 2.2 Ensure native capture smoke remains default-skipped metadata and role-scoped ready rejects it.
- [x] 2.3 Keep readiness success/failure output bounded without frame, command, path, token, or child-output disclosure.

## 3. Tests and Docs

- [x] 3.1 Add smoke argument/plan/fail-closed tests for `--windows-capture`.
- [x] 3.2 Add ready-helper tests for native capture smoke opt-in, skip, role rejection, and failure formatting.
- [x] 3.3 Update README/OpenSpec-facing operator docs for the explicit native capture smoke mode.
- [x] 3.4 Perform a safety review of capture, logs, output redaction, OS input non-use, and forbidden behavior boundaries.

## 4. Verification

- [x] 4.1 Run targeted smoke and ready helper tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
