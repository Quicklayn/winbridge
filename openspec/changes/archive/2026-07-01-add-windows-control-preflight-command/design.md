## Context

`mvp:commands` is a non-executing command generator for a visible two-PC MVP
trial. It already prints `mvp:ready`, native preflight, local smoke, all-smoke,
and post-run audit summary commands. The explicit combined native control smoke
gate exists in `mvp:ready -- --include-windows-control-smoke`, but the command
plan does not yet surface it as a fixed preflight entry or validate it for
drift.

## Goals / Non-Goals

**Goals:**

- Add a fixed Windows control smoke preflight entry to human and JSON command
  plans.
- Require `mvp:ready` command-plan validation to fail closed if the entry is
  missing, renamed, duplicated, or changed.
- Keep the command generator non-executing and bounded.

**Non-Goals:**

- No automatic execution of Windows control smoke.
- No new capture, input, relay, auth, installer, startup, service, privilege,
  unattended, clipboard, credential, browser automation, or persistence
  behavior.
- No change to `--include-all-smoke`; native capture/input remain explicit
  separate opt-ins.

## Decisions

1. Add a separate fixed command entry instead of folding native control into
   all-smoke.
   - Rationale: native capture reads the local screen and native input applies
     OS input, so the combined gate must remain visibly explicit.
   - Alternative considered: include Windows control smoke in
     `--include-all-smoke`. Rejected because current safety guidance keeps
     native capture and input out of aggregate local smoke by default.

2. Validate the exact command string in `mvp:ready`.
   - Rationale: command-plan drift can hide or weaken the most relevant MVP
     readiness gate. Exact matching keeps diagnostics bounded and avoids
     parsing generated command text loosely.

## Risks / Trade-offs

- The preflight list gets one line longer. Mitigation: the new line maps to the
  existing explicit Windows control smoke gate and remains non-executing.
- Existing tests with exact command arrays must be updated. Mitigation: focused
  tests will cover text, JSON, token-env JSON, and drift validation.
