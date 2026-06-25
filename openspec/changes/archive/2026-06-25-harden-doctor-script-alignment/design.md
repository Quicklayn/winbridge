## Context

The root scripts are the operator entrypoints for MVP trials. Existing doctor
checks catch missing script names, workspace manifests, and source files, but a
script can keep its name while losing required build prerequisites or helper
entrypoints.

## Goals / Non-Goals

**Goals:**

- Verify root script alignment using package.json text already read by doctor.
- Keep checks deterministic, read-only, and bounded.
- Report only a fixed reason code and check name.

**Non-Goals:**

- No script execution.
- No shell parsing beyond stable token/ordering checks.
- No changes to command generation, smoke runtime, relay, host, viewer,
  capture, input, authorization, audit, or native adapters.

## Decisions

- Add script alignment as part of the existing `scripts` doctor check.
  - Rationale: alignment is a stronger form of script readiness and avoids a
    new user-facing check category.
- Use conservative ordered substring checks for critical scripts.
  - Rationale: root scripts are simple npm command chains; exact execution
    parsing would add complexity without changing the safety model.
- Require only stable command tokens, not full script equality.
  - Rationale: this allows harmless additions while still catching removal of
    required workspace builds or helper entrypoints.

## Risks / Trade-offs

- Ordered substring checks can reject legitimate future script rewrites.
  - Mitigation: the failure is bounded and local; future rewrites should update
    OpenSpec and doctor expectations intentionally.
- Alignment checks could expose script text if diagnostics are careless.
  - Mitigation: only fixed check names and `script-misaligned` are formatted.
