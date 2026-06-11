## 1. OpenSpec

- [x] 1.1 Add proposal, design, agent-shell-consent-workflow spec, and tasks.
- [x] 1.2 Validate the OpenSpec change in strict mode.

## 2. Agent Shell Runtime

- [x] 2.1 Add `createAgentShellRuntime` with explicit start/stop lifecycle.
- [x] 2.2 Preserve join and hello behavior through the runtime.
- [x] 2.3 Add viewer authorization request behavior for explicit requested permissions.
- [x] 2.4 Add host decision handling with deny-by-default behavior.
- [x] 2.5 Gate active state emission on explicit visible session state.

## 3. Tests and Docs

- [x] 3.1 Add integration test for viewer request reaching host through relay.
- [x] 3.2 Add integration test proving host decision omitted sends no decision.
- [x] 3.3 Add integration test for explicit approve plus visible active state.
- [x] 3.4 Add integration test proving approve without visible state sends no active update.
- [x] 3.5 Update docs with agent-shell consent workflow usage.

## 4. Verification

- [x] 4.1 Run typecheck, tests, build, and strict OpenSpec validation.
- [x] 4.2 Archive the completed OpenSpec change.
- [x] 4.3 Commit and push the completed increment.
