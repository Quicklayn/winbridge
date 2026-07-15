## Context

`mvp:trial` is the operator-facing, non-executing plan for a two-PC development
MVP trial. Its preflight section currently points to session bootstrap and the
evidence fixture, while the generated `mvp:commands` preflight plan separately
contains local all-smoke and native Windows control smoke commands. This
indirection makes the most important real-control readiness checks easy to
miss even though `mvp:ready` validates the trial JSON shape.

## Goals / Non-Goals

**Goals:**

- Surface the complete reviewed local preflight sequence directly in the full
  trial plan.
- Preserve explicit operator opt-in for the native control smoke command.
- Make readiness reject any trial plan that omits, reorders, duplicates, or
  changes the reviewed preflight steps.
- Keep all plan and validation paths non-executing and diagnostics bounded.

**Non-Goals:**

- No automatic screen capture, input application, browser launch, LAN probe,
  relay start, or live role start.
- No changes to native adapters, authorization, consent, visibility,
  revocation, disconnect, tokens, relay behavior, or audit persistence.
- No production UI, packaging, installer, service, startup, or unattended
  access behavior.

## Decisions

1. Add fixed `all-smoke` and `windows-control-smoke` steps between session
   bootstrap and the existing evidence fixture.

   The trial plan becomes self-contained while reusing reviewed root commands.
   The native step remains separate from all-smoke because it reads the local
   screen and applies bounded input. Automatically executing either command was
   rejected because the planner must remain non-executing and native input
   requires a deliberate visible operator action.

2. Validate the complete ordered preflight step array in aggregate readiness.

   `parseMvpTrialPlanReadiness()` already compares each section against an
   exact reviewed shape. Updating its reviewed preflight contract preserves the
   fail-closed boundary without adding a second permissive marker check.
   Role-scoped relay, host, viewer, and browser trial plans remain unchanged
   because they intentionally omit the full preflight section.

3. Use exact command strings shared by convention, not runtime execution or
   child-output parsing.

   This keeps validation bounded and deterministic. Importing an executable
   planner module or running preflight commands during parsing was rejected
   because it would broaden side effects and couple readiness to runtime state.

## Risks / Trade-offs

- Trial output becomes slightly longer -> Keep two added steps fixed and
  bounded in both text and JSON.
- Operators may mistake native smoke for automatic execution -> Retain the
  planner's non-executing safety marker and document that the native command is
  a separate manual opt-in.
- Command drift between trial and command-kit surfaces -> Focused tests and
  aggregate readiness require exact command names, values, and order.
