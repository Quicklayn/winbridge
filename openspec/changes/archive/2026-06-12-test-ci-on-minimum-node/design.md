## Context

WinBridge is currently a TypeScript/Node.js monorepo with `engines.node` set to `>=20.19.0`. The GitHub Actions workflow runs on Windows and executes the same verification commands used locally, but only with Node 24. That leaves minimum-runtime compatibility untested in the public repository workflow.

## Goals / Non-Goals

**Goals:**

- Run CI on Node `20.19.0`, the minimum supported runtime.
- Continue running CI on Node `24`, the current runtime used by the existing workflow.
- Keep CI behavior simple and aligned with `npm run verify` without adding new external services.

**Non-Goals:**

- No product behavior changes.
- No branch protection API changes.
- No GitHub label or issue mutation.
- No changes to security-sensitive remote assistance, relay, auth, audit, capture, input, installer, startup, service, or privilege code.

## Decisions

1. Use a matrix over explicit Node versions.

   Rationale: explicit `20.19.0` tests the declared minimum precisely, and `24` keeps coverage for the current major. A matrix keeps the workflow compact and makes failures attributable to a runtime version.

2. Keep Windows-only runners for now.

   Rationale: the product target is Windows-to-Windows remote assistance, and the current workflow already uses Windows. Cross-OS coverage can be added later if the repo needs Linux/macOS contributor assurance.

3. Keep existing verify steps rather than replacing them with a single `npm run verify`.

   Rationale: separate steps give clearer GitHub Actions failure names for typecheck, tests, build, and OpenSpec validation.

## Risks / Trade-offs

- CI runtime increases because the job runs twice. Mitigation: the project is still small, and the compatibility assurance is worth the added minutes.
- Node patch availability can change on GitHub-hosted runners. Mitigation: `actions/setup-node@v4` installs requested versions when absent.
