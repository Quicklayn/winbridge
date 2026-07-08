## 1. LAN Probe CLI

- [x] 1.1 Add `mvp:lan-probe` root script.
- [x] 1.2 Implement bounded argument parsing and validation.
- [x] 1.3 Implement host/viewer WebSocket join and paired relay-ready detection.
- [x] 1.4 Keep output bounded in text and JSON modes.
- [x] 1.5 Fail closed for malformed input, timeout, token denial, relay errors, and unexpected messages.

## 2. Docs and Review

- [x] 2.1 Update README with the two-PC LAN probe workflow.
- [x] 2.2 Update main OpenSpec specs for the archived requirement.
- [x] 2.3 Perform a security review for relay/session/token probe behavior.

## 3. Verification

- [x] 3.1 Run focused LAN probe tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
