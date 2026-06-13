## Context

The repository already has a Windows GitHub Actions workflow that installs dependencies, typechecks, tests, builds, and runs strict OpenSpec validation on Node `20.19.0` and Node `24`. The remaining gap is operational hardening: the workflow should explicitly request only read access to repository contents and bound job runtime so an automation failure cannot run indefinitely.

## Goals / Non-Goals

**Goals:**

- Keep CI verification least-privilege by declaring read-only repository permissions.
- Bound each matrix job with an explicit timeout.
- Preserve the existing Windows and Node runtime verification matrix.

**Non-Goals:**

- No change to product runtime behavior, protocol schemas, relay routing, agent-shell behavior, audit persistence, or npm dependencies.
- No change to remote assistance capabilities, host consent, visibility, revocation, authorization, tokens, installer, startup, services, native Windows APIs, capture, input, or privilege behavior.
- No production identity or deployment policy changes.

## Decisions

- Add workflow-level `permissions: contents: read` instead of broader write-capable defaults. This is sufficient for checkout and verification-only jobs, and it keeps future workflow steps from gaining write permissions by omission.
- Add `timeout-minutes` at the job level instead of per-step timeouts. The job-level bound covers install, test, build, and OpenSpec validation together across every matrix entry while keeping YAML simple.
- Keep the current Node matrix unchanged. This change hardens execution policy around the existing verification contract rather than redefining supported runtime versions.

## Risks / Trade-offs

- GitHub Actions checkout behavior could require additional permissions if future steps fetch private submodules or write checks. Mitigation: keep the workflow verification-only; future write-capable automation must make its permission need explicit in a separate OpenSpec change.
- A timeout that is too short could fail slow Windows runners. Mitigation: use a conservative timeout suitable for the current small TypeScript workspace while still preventing indefinite runs.
