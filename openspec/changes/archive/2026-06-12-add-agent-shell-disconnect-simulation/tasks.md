## 1. Runtime and CLI

- [x] 1.1 Add bounded `hostDisconnectAfterMs` runtime option validation.
- [x] 1.2 Schedule host local disconnect only after active visible authorization.
- [x] 1.3 Suppress later delayed host workflow messages after local disconnect fires.
- [x] 1.4 Add `--disconnect-after-ms` CLI parsing and usage text.

## 2. Tests and Docs

- [x] 2.1 Add argument parser coverage for valid and malformed disconnect delay values.
- [x] 2.2 Add integration tests for host disconnect after visible activation and relay-originated viewer notice.
- [x] 2.3 Add integration tests that disconnect is withheld without visible activation and suppresses later workflow messages.
- [x] 2.4 Document the development disconnect simulation in README/security/architecture docs.

## 3. Review and Verification

- [x] 3.1 Run security review for workflow/network lifecycle changes.
- [x] 3.2 Run focused agent-shell runtime and args tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Archive the completed OpenSpec change and rerun validation.
