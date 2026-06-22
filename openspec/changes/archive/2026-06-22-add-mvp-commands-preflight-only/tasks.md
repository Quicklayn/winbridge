## 1. Implementation

- [x] 1.1 Parse `--preflight-only` as a sole flag-only command kit option.
- [x] 1.2 Render bounded preflight-only command output.
- [x] 1.3 Preserve existing default output, help output, and bounded usage failures.

## 2. Tests

- [x] 2.1 Cover preflight-only output includes doctor, native preflight, and smoke commands.
- [x] 2.2 Cover preflight-only output excludes relay, host, viewer, browser, capture, and input command steps.
- [x] 2.3 Cover malformed `--preflight-only` combinations fail closed without echoing raw values.

## 3. Verification

- [x] 3.1 Run focused MVP session command kit tests.
- [x] 3.2 Run `npm run mvp:commands -- --preflight-only`.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Run strict OpenSpec validation for this change.
