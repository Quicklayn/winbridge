## 1. CLI Relay URL Validation

- [x] 1.1 Add agent-shell argument tests for accepted `ws://` and `wss://` relay URLs and rejected malformed, relative, or non-WebSocket URLs.
- [x] 1.2 Validate `--relay` with the standard URL parser and `ws:`/`wss:` protocol allow-list before runtime startup.
- [x] 1.3 Update docs if CLI validation notes need relay URL clarification.

## 2. Verification

- [x] 2.1 Run focused agent-shell argument tests.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Archive the OpenSpec change after implementation and verification are complete.
