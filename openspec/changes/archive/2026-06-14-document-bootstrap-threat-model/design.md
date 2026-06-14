## Context

The project already has explicit safety boundaries, release readiness,
privacy/data-handling notes, GitHub templates, and OpenSpec review gates. The
missing piece is a compact threat model that ties those controls to concrete
assets, trust boundaries, abuse cases, and future capability gates.

This change is documentation and process hardening only. It does not alter
protocol schemas, relay routing, authorization behavior, audit persistence,
agent-shell workflow behavior, or CI execution.

## Goals / Non-Goals

**Goals:**

- Document the current bootstrap threat model in a dedicated repository file.
- Make that file discoverable from security and release workflows.
- Require future high-risk capability planning to update the threat model.
- Keep current non-capabilities and permanent prohibitions explicit.

**Non-Goals:**

- Do not add production identity, production relay, telemetry, retention, or
  hosted-service privacy claims.
- Do not add screen capture, input injection, clipboard, file transfer,
  diagnostics, remote shell, native Windows APIs, installer, startup, services,
  privilege elevation, or background components.
- Do not loosen any existing OpenSpec or security review gate.

## Decisions

1. Keep the threat model bootstrap-scoped.

   Rationale: the repository is not yet production remote assistance software.
   A production threat model would imply account, hosting, retention,
   subprocessors, support access, and native endpoint behavior that does not
   exist yet.

2. Link the threat model from security and release docs.

   Rationale: maintainers are most likely to look at `SECURITY.md` and the
   release checklist before high-risk changes or releases.

3. Track the gate under `agent-orchestration`.

   Rationale: this is repository workflow and review-process behavior, not a
   runtime protocol capability.

## Risks / Trade-offs

- **Risk: Documentation drifts from implementation.** -> Mitigation: release
  checklist requires threat model review and update when security or data
  boundaries change.
- **Risk: Threat model is mistaken for production coverage.** -> Mitigation:
  scope statements explicitly say it applies only to the current bootstrap.
- **Risk: Docs imply future native work can start immediately.** -> Mitigation:
  future gates require OpenSpec design and security review before native or
  production capability work begins.
