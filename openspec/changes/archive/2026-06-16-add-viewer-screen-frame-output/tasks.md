## 1. Runtime And CLI Wiring

- [x] 1.1 Add a viewer screen-frame output sink that validates output paths and writes frame bytes only to the explicit configured file.
- [x] 1.2 Add viewer-only CLI parsing for the output path and reject host use, missing `screen:view`, missing local audit configuration, and unsafe paths before runtime startup.
- [x] 1.3 Wire the runtime to invoke the sink only after inbound `screen-frame` authorization succeeds and after metadata-only audit persistence succeeds.
- [x] 1.4 Keep public runtime events, logs, thrown errors, and audit details metadata-only and redacted.

## 2. Tests And Documentation

- [x] 2.1 Add parser tests for valid viewer output path and malformed role/permission/path combinations.
- [x] 2.2 Add runtime/integration tests for authorized frame writes, stale/revoked authorization, audit failure, and redacted diagnostics.
- [x] 2.3 Update README/roadmap/threat model to describe the explicit viewer output boundary and remaining MVP gaps.
- [x] 2.4 Run security review for screen-byte persistence, authorization, audit, diagnostics/logs, services/startup/elevation non-goals, and OpenSpec impact.
- [x] 2.5 Validate the OpenSpec change in strict mode.

## 3. Verification

- [x] 3.1 Run focused agent-shell viewer output tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the completed OpenSpec change and re-run OpenSpec validation.
