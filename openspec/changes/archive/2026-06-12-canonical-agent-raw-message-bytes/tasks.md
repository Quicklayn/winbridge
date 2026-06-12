## Implementation

- [x] 1. Normalize inbound agent-shell WebSocket `RawData` into text plus original raw byte length before protocol parsing.
- [x] 2. Use the original raw byte length for non-protocol `raw` events/logs and ignored unsafe inbound summaries.
- [x] 3. Add runtime integration coverage for binary non-protocol input with accurate redacted byte metadata.
- [x] 4. Sync the accepted requirement into `openspec/specs/agent-shell-consent-workflow/spec.md`.

## Verification

- [x] 5. Run focused agent-shell raw message byte metadata tests.
- [x] 6. Run `npm run check`.
- [x] 7. Run `npm test`.
- [x] 8. Run `npm run build`.
- [x] 9. Run `npm run openspec:validate`.
- [x] 10. Complete focused security review for local raw inbound event/log metadata.
