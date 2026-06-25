## 1. CLI Indicator Logging

- [x] 1.1 Wire the agent-shell CLI to the existing bounded runtime logger so host indicator markers are visible to smoke.
- [x] 1.2 Add focused coverage for CLI-visible host indicator output without weakening the smoke parser.

## 2. Verification

- [x] 2.1 Run focused smoke/CLI tests.
- [x] 2.2 Run `npm run mvp:smoke -- --json`.
- [x] 2.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 3. Review

- [x] 3.1 Review diagnostic output safety and archive the change.
