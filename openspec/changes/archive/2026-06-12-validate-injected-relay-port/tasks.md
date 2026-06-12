## 1. Implementation

- [x] 1.1 Validate injected `RelayRuntimeOptions.port` values during relay runtime construction.
- [x] 1.2 Preserve default port `8787` and injected ephemeral port `0` behavior.
- [x] 1.3 Update architecture/security docs for injected relay port validation.

## 2. Verification

- [x] 2.1 Add focused relay runtime tests for invalid injected port values and valid injected ports.
- [x] 2.2 Run focused relay runtime tests.
- [x] 2.3 Complete security review for the relay networking configuration diff.
- [x] 2.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.5 Sync the completed OpenSpec delta into main specs and archive the change.
