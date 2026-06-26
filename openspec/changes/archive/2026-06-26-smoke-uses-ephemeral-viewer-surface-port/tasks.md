## Tasks

- [x] Add the OpenSpec delta for ephemeral viewer surface smoke behavior.
- [x] Update the smoke plan/runtime to use `--viewer-control-surface-port 0` by default and resolve the actual viewer URL from bounded child output.
- [x] Add tests for safe URL parsing, unsafe URL rejection, explicit fixed-port test hooks, and bounded diagnostics.
- [x] Update README smoke guidance.
- [x] Run focused smoke tests and strict OpenSpec validation.
- [x] Run full verification: `npm run check`, `npm test`, `npm run build`, `npm run openspec:validate`, `git diff --check`.
