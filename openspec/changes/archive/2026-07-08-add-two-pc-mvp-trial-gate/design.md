## Context

The current MVP flow already has separate helpers for readiness
(`mvp:ready`), command generation (`mvp:commands`), local smoke
(`mvp:smoke`), and strict post-run audit evidence (`mvp:audit-summary`). A
two-PC trial is therefore possible, but it is scattered across README sections.
The gap is operational: an operator needs one bounded command that says which
existing gates to run on relay, host, viewer, and after the trial.

## Goals / Non-Goals

**Goals:**

- Add a root trial helper that prints a fixed, safe two-PC operator sequence.
- Provide role-scoped output for relay, host, viewer, and post-run evidence
  without executing the remote-assistance runtime.
- Provide an evidence mode that validates explicit local host/viewer audit logs
  through the strict audit-summary gate.
- Keep text and JSON output bounded and secret-safe.

**Non-Goals:**

- No production desktop UI, installer, service, updater, hosted relay, account
  auth, NAT traversal, firewall automation, or packaging.
- No hidden sessions, unattended access, persistence, privilege elevation,
  credential access, keylogging, clipboard access, file transfer, AV/EDR
  evasion, Windows prompt bypass, or automatic browser/control automation.
- No new capture, input, relay, authorization, or audit record semantics.

## Decisions

1. Add a non-executing root helper instead of expanding `mvp:commands`.
   - Rationale: `mvp:commands` is already responsible for rendering runnable
     role commands. A separate `mvp:trial` can reference those commands and the
     post-run verifier without making the command kit harder to reason about.
   - Alternative considered: add more `mvp:commands --only` variants. Rejected
     because the missing behavior is workflow orchestration, not another single
     role command block.

2. Reuse `mvp:audit-summary -- --require-mvp-evidence` for evidence mode.
   - Rationale: strict role-bound evidence already exists and is the right
     source of truth for proving consent, visible active state, frame, input,
     revocation, and disconnect evidence.
   - Alternative considered: parse audit logs directly in `mvp:trial`.
     Rejected to avoid duplicate audit parsing and evidence definitions.

3. Keep plan mode read-only and non-executing.
   - Rationale: planning the two-PC workflow must be safe to run on any
     developer machine and must not start relay, host, viewer, browser,
     capture, input, sockets, or listeners.
   - Alternative considered: one command that starts local processes. Rejected
     because a real two-PC trial requires operator placement and explicit host
     consent on the host PC.

## Risks / Trade-offs

- The helper still cannot prove a two-PC run happened until operators provide
  local audit logs -> require a separate evidence mode and document it as the
  post-run gate.
- The helper may lag behind existing scripts -> add tests that assert it
  references the reviewed readiness, command-plan, and strict audit-summary
  commands.
- Evidence mode invokes another local Node helper and reads explicit logs ->
  validate arguments before delegation and preserve bounded diagnostics.
