## Context

`mvp:smoke -- --windows-input` is an explicit developer-only smoke path that
enables the existing consent-bound host Windows input adapter and waits for
host audit evidence before reporting the fixed `windows-input` subcheck as
passed. The current readiness helper only matches the fixed action name in the
bounded smoke audit parser, so denied or failed records with the same action can
satisfy the subcheck.

## Goals / Non-Goals

**Goals:**

- Require accepted host audit evidence before the native Windows input smoke
  subcheck passes.
- Keep all failure output on the existing bounded `windows-input-not-ready`
  path.
- Add focused tests for accepted, denied, and failed evidence.

**Non-Goals:**

- No new input command shape or native input adapter behavior.
- No changes to consent, authorization, relay, capture, installer, startup,
  service, privilege, clipboard, credential, or browser automation behavior.
- No raw audit timeline output or path disclosure.

## Decisions

1. Enforce accepted outcome in the smoke-local audit action helper.
   - Rationale: the helper is used for the Windows input audit gate and already
     parses bounded JSONL records locally. Requiring `outcome === "accepted"`
     keeps the readiness contract close to the evidence check.
   - Alternative considered: add a second helper with a new name. Rejected for
     this small scope because the existing helper's only runtime use is this
     accepted-evidence gate.

2. Reuse `windows-input-not-ready` for denied or failed audit outcomes.
   - Rationale: diagnostics should not reveal whether the missing evidence was
     absent, malformed, denied, failed, or delayed.

3. Keep the explicit opt-in unchanged.
   - Rationale: the change verifies evidence only. It must not make OS input
     easier to enable or run by default.

## Risks / Trade-offs

- Stricter evidence may fail a smoke run that previously passed with a denied
  or failed audit record. Mitigation: that is the intended fail-closed behavior
  for MVP readiness.
- The helper name remains action-oriented even though it now requires accepted
  outcome. Mitigation: tests and spec clarify the accepted-evidence semantics.
