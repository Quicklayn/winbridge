## Context

The trial helper gained a browser role so the viewer operator can print only
the loopback viewer-surface instruction. The readiness helper still validates
trial JSON using the older role set, so default readiness can miss a broken or
missing browser trial section.

## Goals / Non-Goals

**Goals:**

- Require the browser section when parsing full `mvp:trial -- --json` output.
- Add browser role-scoped trial validation through
  `mvp:trial -- --role browser --json`.
- Keep all validation non-executing and bounded.
- Preserve existing relay, host, viewer, evidence, command-kit, and runner
  validation behavior.

**Non-Goals:**

- No runtime process launch beyond the existing non-executing child checks.
- No browser launch, browser automation, capture, input, relay connection, LAN
  probing, audit-file writes, installer, startup persistence, or privilege
  elevation.
- No changes to `mvp:trial` output shape beyond validating the current browser
  section.

## Decisions

1. Treat browser as a trial-plan role, but not as an MVP runtime runner role.

   Browser is an operator checklist section. It should be validated by
   `mvp:ready`, while `mvp:run` remains relay/host/viewer only.

2. Reuse the existing `parseMvpTrialPlanReadiness()` path.

   Adding browser to the reviewed role details keeps failure behavior and
   redaction consistent with existing trial validation.

3. Add browser only to trial role validation, not `--role browser` readiness.

   Current `mvp:ready -- --role viewer` already validates browser command
   blocks because the browser surface belongs to the viewer PC. This change
   adds the missing trial-plan coverage without inventing a new ready role.

## Risks / Trade-offs

- A stricter default ready check may expose stale test fixtures -> Mitigation:
  update focused readiness fixtures and drift tests together.
- Browser role can be confused with runtime roles -> Mitigation: keep runner
  role lists unchanged and document that browser validation is non-executing.
