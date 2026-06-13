## Why

GitHub Actions currently verifies the project, but the workflow does not declare the minimal permissions it needs or a bounded runtime for each matrix job. A least-privilege, timeout-bounded CI workflow reduces repository automation risk and makes failed or hanging verification easier to reason about.

## What Changes

- Declare read-only repository permissions for the CI workflow.
- Add an explicit job timeout for the Windows verification matrix.
- Document the CI hardening expectation in the agent-orchestration workflow contract.
- Do not change product runtime behavior, remote assistance protocols, relay routing, capture, input, auth, installer, startup, services, tokens, logs, or privilege behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-orchestration`: require GitHub CI to run with least-privilege repository permissions and bounded job duration.

## Impact

- Affected workflow: `.github/workflows/ci.yml`.
- Affected specification: `openspec/specs/agent-orchestration/spec.md`.
- No runtime APIs, npm dependencies, protocol contracts, relay behavior, agent-shell behavior, audit persistence, or Windows native behavior are changed.
- Safety impact: no remote capability is added; host consent, visibility, revocation, audit, and abuse-prevention invariants remain unchanged.
