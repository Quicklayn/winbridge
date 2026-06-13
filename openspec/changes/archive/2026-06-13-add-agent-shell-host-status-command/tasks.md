## 1. Runtime Status Snapshot

- [x] 1.1 Add a host-only managed runtime `getHostStatus()` snapshot with inactive, active, paused, and terminal status mapping.
- [x] 1.2 Ensure the status snapshot is read-only and uses only bounded lifecycle metadata without permission names, peer identity, reasons, payloads, tokens, or pairing codes.

## 2. Host Control Prompt

- [x] 2.1 Add exact `status` command parsing and prompt help text.
- [x] 2.2 Print a secret-safe status line without invoking host lifecycle controls, public sends, or protocol construction.

## 3. Tests And Documentation

- [x] 3.1 Add host-control-prompt tests for exact status parsing, malformed status rejection, secret-safe output, and no control/send invocation.
- [x] 3.2 Add runtime integration tests for inactive, active narrowed-grant, paused, terminal, and viewer-rejected host status snapshots.
- [x] 3.3 Update README, architecture, and security docs for the read-only development host status command.

## 4. Verification

- [x] 4.1 Run targeted host-control-prompt and runtime integration tests.
- [x] 4.2 Complete security review for status output, read-only behavior, and authorization metadata boundaries.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
