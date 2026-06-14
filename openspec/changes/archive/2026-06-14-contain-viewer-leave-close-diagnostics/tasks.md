## 1. Runtime Cleanup

- [x] 1.1 Make WebSocket close event callback and disconnected logging best-effort without changing cleanup ordering.
- [x] 1.2 Preserve viewer local leave status and connection-scoped authorization clearing when close diagnostics fail.

## 2. Tests And Documentation

- [x] 2.1 Add integration coverage for viewer local leave when the close event callback throws.
- [x] 2.2 Add integration coverage for viewer local leave when disconnected logging throws.
- [x] 2.3 Update security documentation for best-effort viewer leave close diagnostics.

## 3. Review And Verification

- [x] 3.1 Run focused agent-shell runtime tests for viewer leave close diagnostics.
- [x] 3.2 Run strict OpenSpec validation for `contain-viewer-leave-close-diagnostics`.
- [x] 3.3 Run security review for log/diagnostic handling and consent-first invariants.
- [x] 3.4 Run full project verification: `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
