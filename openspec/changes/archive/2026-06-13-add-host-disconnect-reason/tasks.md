## 1. OpenSpec

- [x] 1.1 Validate `add-host-disconnect-reason` strictly before implementation.

## 2. Implementation

- [x] 2.1 Add `--disconnect-reason` parsing and direct runtime `hostDisconnectReason` validation.
- [x] 2.2 Use the validated disconnect reason only for host local WebSocket close metadata.

## 3. Tests and Docs

- [x] 3.1 Add focused CLI parsing and runtime integration coverage for accepted, rejected, and redacted host disconnect reasons.
- [x] 3.2 Document host disconnect reason behavior and safety boundaries.

## 4. Verification

- [x] 4.1 Run focused agent-shell tests for disconnect reason behavior.
- [x] 4.2 Review the diff against consent, visibility, disconnect, audit redaction, and no-remote-action safety boundaries.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
