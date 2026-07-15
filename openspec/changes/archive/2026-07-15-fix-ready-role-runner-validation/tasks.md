## 1. Silent Runner Validation

- [x] 1.1 Add npm silent invocation only to aggregate role-runner dry-run steps.
- [x] 1.2 Require exact ordered runner `args` and `env` metadata while keeping roles, dry-run generation, and bounded diagnostics unchanged.

## 2. Focused Tests

- [x] 2.1 Update readiness plan expectations for silent runner invocations.
- [x] 2.2 Add fail-closed coverage for npm banner contamination and extra runner argument/environment metadata, then verify the focused readiness suite.
- [x] 2.3 Run the real default and viewer-scoped `mvp:ready -- --json` gates.

## 3. Review And Verification

- [x] 3.1 Resolve security review findings for token, pairing, relay, child-output, and non-executing safety boundaries.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
