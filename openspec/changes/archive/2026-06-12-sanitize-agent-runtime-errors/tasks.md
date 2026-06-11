## 1. Runtime Error Hardening

- [x] 1.1 Sanitize runtime `error` events so raw exception messages are replaced with a generic message and safe byte-length metadata.
- [x] 1.2 Sanitize runtime and socket error logs so raw `Error.message` values are not logged.
- [x] 1.3 Add focused runtime integration coverage proving audit-sink failure events and logs do not expose raw exception text.

## 2. Documentation and Specs

- [x] 2.1 Update architecture and security documentation to state that runtime/socket error diagnostics are metadata-only.
- [x] 2.2 Sync the accepted delta requirement into `openspec/specs/agent-shell-consent-workflow/spec.md`.

## 3. Verification and Review

- [x] 3.1 Run focused agent-shell runtime tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for runtime error event/log handling.
- [x] 3.4 Archive the completed OpenSpec change after validation.
