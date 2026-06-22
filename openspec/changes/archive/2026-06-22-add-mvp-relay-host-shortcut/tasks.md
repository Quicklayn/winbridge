## 1. Implementation

- [x] 1.1 Parse and validate `--relay-host` as a bounded shortcut option.
- [x] 1.2 Render text command plans from `--relay-host`.
- [x] 1.3 Render JSON command plans from `--relay-host`.
- [x] 1.4 Reject malformed shortcut hosts and conflicts with `--relay`.
- [x] 1.5 Document the shortcut in README.

## 2. Tests

- [x] 2.1 Cover text output for a relay host shortcut.
- [x] 2.2 Cover JSON output for a relay host shortcut.
- [x] 2.3 Cover malformed host and `--relay` conflict failures.

## 3. Verification

- [x] 3.1 Run focused MVP command-kit tests.
- [x] 3.2 Run `npm run mvp:commands -- --relay-host 192.168.1.10`.
- [x] 3.3 Run `npm run mvp:commands -- --relay-host relay-pc.local --json`.
- [x] 3.4 Run `npm run check`.
- [x] 3.5 Run `npm test`.
- [x] 3.6 Run `npm run build`.
- [x] 3.7 Run `npm run openspec:validate`.
- [x] 3.8 Run strict OpenSpec validation for this change.
