## 1. Runtime And CLI Wiring

- [x] 1.1 Add `@winbridge/windows-capture` as an agent-shell dependency and TypeScript project reference.
- [x] 1.2 Add host-only `--dev-screen-frame-source static|windows-capture` parsing with static/capture option compatibility validation.
- [x] 1.3 Add a runtime capture-and-send method that validates internal active visible `screen:view` authorization, routing, socket, peer state, and capture audit before invoking the adapter.
- [x] 1.4 Wire one-shot and finite stream schedulers to call the runtime capture method for Windows capture source without overlapping async captures.

## 2. Tests And Documentation

- [x] 2.1 Add parser tests for valid capture source and malformed role/source/static-payload/count/interval combinations.
- [x] 2.2 Add scheduler/runtime tests for authorized captured sends, waiting before authorization, authorization-loss stop, audit-before-capture failure, capture adapter failure, and redacted diagnostics.
- [x] 2.3 Add integration coverage proving captured frames reach the viewer only through existing consent-bound screen-frame send gates.
- [x] 2.4 Update README/roadmap/threat model for the Windows capture source boundary and remaining MVP gaps.
- [x] 2.5 Run security review for native capture wiring, authorization, audit, diagnostics/logs, services/startup/elevation non-goals, and OpenSpec impact.
- [x] 2.6 Validate the OpenSpec change in strict mode.

## 3. Verification

- [x] 3.1 Run focused agent-shell capture source tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the completed OpenSpec change and re-run OpenSpec validation.
