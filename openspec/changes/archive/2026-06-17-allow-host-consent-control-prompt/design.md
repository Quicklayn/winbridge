## Context

WinBridge's development MVP can now run a visible relay/host/viewer workflow
with capture, viewer frame display, and host input application. The generated
MVP host command currently uses static approval so it can also enable the host
control prompt. That is less desirable than showing the host the interactive
consent request before access is approved.

The main implementation issue is stdin ownership. The consent prompt and host
control prompt both read from the host terminal. Running them concurrently would
make input ambiguous, so the control prompt must be sequenced after consent
approval and active visible authorization.

## Goals / Non-Goals

**Goals:**

- Allow `--host-consent-prompt true --host-control-prompt true` for host
  runtimes only.
- Start host controls only after the host has approved the interactive consent
  prompt and the runtime reports an active visible host indicator.
- Keep deny, timeout, cancel, disconnect-before-decision, and invalid consent
  paths from starting host controls.
- Update `npm run mvp:commands` to print the safer interactive host workflow.

**Non-Goals:**

- No changes to protocol authorization semantics.
- No new host control commands or native Windows capabilities.
- No background process manager, service, installer, startup persistence,
  unattended access, clipboard, file transfer, diagnostics, remote shell,
  privilege elevation, AV/EDR evasion, or Windows prompt bypass.

## Decisions

1. Reuse runtime indicator events to sequence host control prompt startup.

   Rationale: the runtime already emits a host indicator event when approval
   becomes active and visible. The CLI can listen for that event and start the
   prompt once, without weakening runtime control gates.

2. Keep immediate host control prompt startup for static host decisions.

   Rationale: existing deterministic tests and development flows that use
   static approval should remain unchanged. Only the interactive consent
   combination needs delayed startup to avoid stdin conflict.

3. Preserve one-shot host status mutual exclusion.

   Rationale: host control prompt already exposes `status`; running both prompt
   and one-shot status is still ambiguous and unnecessary.

## Risks / Trade-offs

- [Risk] Host controls might start after a stale event. -> Mitigation: start
  only for host indicator events with `state=active` and `visibleToHost=true`;
  the runtime remains authoritative for all later control validity.
- [Risk] Denied or timed-out consent could still expose a control prompt. ->
  Mitigation: the CLI starts delayed controls only on active indicator events,
  not on prompt completion alone.
- [Risk] The prompt may start more than once after resume events. -> Mitigation:
  keep a single local handle and do nothing if it already exists.

## Migration Plan

Existing commands remain valid. New MVP command output switches from
`--host-decision approve` to `--host-consent-prompt true` while keeping
`--host-control-prompt true`. Rollback is restoring the parser rejection and the
static approval command output.

## Open Questions

- A future native host UI should provide a dedicated consent and control surface
  rather than relying on terminal stdin.
