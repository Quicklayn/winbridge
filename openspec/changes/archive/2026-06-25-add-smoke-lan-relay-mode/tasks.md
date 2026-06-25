## 1. Smoke LAN-Style Mode

- [x] 1.1 Add `--lan-relay` parsing and usage text to `mvp:smoke`.
- [x] 1.2 Route host/viewer smoke processes through `ws://127.0.0.1:<resolved-port>/` when LAN-style mode is enabled.
- [x] 1.3 Keep JSON/default output bounded and unchanged aside from the explicit mode behavior.

## 2. Ready Integration And Docs

- [x] 2.1 Run LAN-style smoke from `mvp:ready --include-smoke` after the default smoke step passes.
- [x] 2.2 Document the new smoke mode and its safety boundaries in README.

## 3. Verification

- [x] 3.1 Add focused unit tests for argument parsing, plan generation, and ready aggregation.
- [x] 3.2 Run focused smoke/ready tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 4. Review

- [x] 4.1 Review relay/smoke safety invariants and archive the change.
