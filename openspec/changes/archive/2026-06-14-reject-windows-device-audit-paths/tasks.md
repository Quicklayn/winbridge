## 1. Audit Path Validation

- [x] 1.1 Add shared audit log path validation for Windows reserved device path segments.
- [x] 1.2 Keep validation errors bounded and free of raw path text.
- [x] 1.3 Preserve safe lookalike audit paths that do not resolve to reserved device names.

## 2. Tests

- [x] 2.1 Add focused file audit sink tests for reserved device paths.
- [x] 2.2 Add focused file audit sink tests for safe lookalike paths.
- [x] 2.3 Run focused audit-log tests.

## 3. Verification

- [x] 3.1 Complete security review for audit path validation impact on consent evidence, relay/agent startup, logs, and non-authorizing behavior.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the OpenSpec change after implementation is verified.
