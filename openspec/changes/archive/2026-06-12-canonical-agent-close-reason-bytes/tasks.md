## Implementation

- [x] 1. Calculate agent-shell close `reasonBytes` with explicit byte-length semantics instead of `.length`.
- [x] 2. Add runtime integration coverage for a multi-byte private close reason that remains redacted in events and logs.
- [x] 3. Sync the accepted requirement into `openspec/specs/agent-shell-consent-workflow/spec.md`.

## Verification

- [x] 4. Run focused agent-shell close reason tests.
- [x] 5. Run `npm run check`.
- [x] 6. Run `npm test`.
- [x] 7. Run `npm run build`.
- [x] 8. Run `npm run openspec:validate`.
- [x] 9. Complete focused security review for local close event/log metadata.
