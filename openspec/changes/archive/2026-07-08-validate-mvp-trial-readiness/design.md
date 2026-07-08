## Context

The two-PC MVP operator path now has a dedicated `mvp:trial` helper. Current
readiness already validates `mvp:commands` command plans and role filters, but
it does not execute the trial helper in JSON plan mode. The doctor checks the
script exists, but it does not yet fail when the root script points away from
the reviewed helper entrypoint.

## Goals / Non-Goals

**Goals:**

- Add bounded trial-plan validation to default `mvp:ready`.
- Add bounded role-specific trial-plan validation to role-scoped readiness.
- Add doctor root-script alignment for `mvp:trial`.
- Keep all validation non-executing and secret-safe.

**Non-Goals:**

- No evidence-mode readiness check because it requires explicit post-run audit
  files.
- No changes to relay, host, viewer, capture, input, authorization, audit
  record semantics, installer behavior, services, startup persistence, or
  production UI.

## Decisions

1. Validate `mvp:trial -- --json` in default readiness.
   - Rationale: the default gate should prove the top-level operator workflow
     can still render every fixed section.
   - Alternative considered: validate text mode only. Rejected because JSON is
     easier to parse without exposing command output in readiness diagnostics.

2. Validate `mvp:trial -- --role <role> --json` in role readiness.
   - Rationale: each machine should know that its matching operator section
     still renders before a live trial.
   - Alternative considered: run the full plan in every role mode. Rejected
     because role readiness should stay scoped to the local operator context.

3. Keep evidence mode out of `mvp:ready`.
   - Rationale: evidence mode needs host/viewer audit files produced after the
     trial, so it is not a preflight readiness check.

## Risks / Trade-offs

- Readiness takes a few more local Node process invocations -> the helper is
  lightweight and non-native, so the extra cost is acceptable.
- Parser drift could reject valid future trial JSON -> tests will cover the
  exact reviewed shape and fail closed until the readiness parser is updated.
