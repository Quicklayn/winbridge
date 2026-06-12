## Why

The repository declares Node.js support from `>=20.19.0`, but GitHub Actions currently verifies only Node 24. CI can miss regressions that break the minimum supported runtime used by contributors and future deployment automation.

## What Changes

- Update GitHub Actions CI to run the full verification sequence on Node `20.19.0` and Node `24`.
- Keep the Windows runner because the product targets Windows-to-Windows remote assistance.
- Document that local development should still run `npm run verify`, while CI proves the minimum and current runtime versions.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-orchestration`: repository workflow expectations now require CI coverage for the minimum supported Node runtime and the current stable Node runtime.

## Impact

- Affected files: `.github/workflows/ci.yml`, `docs/github-setup.md`, `README.md`, and OpenSpec artifacts.
- Security impact: improves repository process assurance. It does not touch capture, input, authentication, authorization, relay routing, tokens, logs, installer behavior, startup behavior, services, or privilege elevation.
- Non-goals: no change to product runtime behavior, protocol schemas, relay behavior, agent-shell consent behavior, GitHub branch protection settings, labels, or issue creation.
