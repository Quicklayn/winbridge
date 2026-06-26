## 1. Agent Shell

- [x] 1.1 Accept `--viewer-control-surface-port 0` only for the existing viewer frame-output path.
- [x] 1.2 Keep local surface binding loopback-only and update validation wording for explicit ephemeral mode.

## 2. Command Kit and Docs

- [x] 2.1 Allow command kit `--viewer-control-surface-port 0` and render a bounded browser instruction that points to the viewer log URL.
- [x] 2.2 Update tests and README/OpenSpec docs for fixed-port default and explicit ephemeral mode.

## 3. Verification

- [x] 3.1 Run focused args, surface, and command-kit tests.
- [x] 3.2 Run repository verification (`npm run check`, `npm test`, `npm run build`, `npm run openspec:validate`, and `git diff --check`).
