## Context

`apps/agent-shell` already has two local viewer development helpers:

- `--viewer-status-after-ms` prints one bounded `getViewerStatus()` snapshot.
- `--viewer-disconnect-after-ms` stops only the local viewer runtime after a delay.

The host side also has an interactive control prompt for repeated local lifecycle exercises. The viewer side needs a smaller equivalent for future viewer UI wiring: repeated local status reads and an explicit local leave command. The project remains a non-native protocol simulator and must not add capture, input, clipboard, file transfer, diagnostics, reconnect, hidden session, or host lifecycle capability.

## Goals / Non-Goals

**Goals:**

- Add `--viewer-control-prompt true` as a viewer-only opt-in CLI mode.
- Accept exact `status` and `disconnect` command lines only.
- Reuse the existing viewer status formatter for `status`.
- Use `runtime.stop()` for `disconnect` so the viewer only closes its own local relay connection.
- Sanitize prompt errors through existing CLI diagnostics and avoid echoing raw input.
- Reject host-mode, malformed boolean, and ambiguous one-shot viewer status/disconnect timer combinations before runtime startup.

**Non-Goals:**

- No protocol schema changes.
- No relay behavior changes.
- No production account/auth changes.
- No host pause, resume, revoke, terminate, or host disconnect controls from the viewer prompt.
- No screen capture, input injection, clipboard sync, file transfer, diagnostics collection, reconnect, installer/startup/service work, token handling changes, or privilege elevation.

## Decisions

- Implement a new `viewer-control-prompt.ts` module instead of extending `host-control-prompt.ts`.
  - Rationale: the allowed command set and runtime methods are different, and separating modules keeps host lifecycle controls out of the viewer prompt type surface.
  - Alternative considered: a generic prompt factory. Rejected because the current duplication is small and a shared abstraction would make role-specific safety boundaries less obvious.
- Reuse `formatViewerStatus()` from `viewer-status.ts`.
  - Rationale: keeps one output shape for scheduled and interactive viewer status reads.
  - Alternative considered: duplicate the formatter. Rejected to avoid drift in redaction and bounded metadata.
- Treat `disconnect` as local runtime stop, not managed host disconnect.
  - Rationale: a viewer can always leave locally, but must not forge relay lifecycle notices or invoke host controls.
  - Alternative considered: adding a viewer runtime `disconnect()` wrapper. Rejected because `runtime.stop()` already expresses local shutdown and avoids overloading the host-only disconnect control.
- Make viewer control prompt mutually exclusive with `--viewer-status-after-ms` and `--viewer-disconnect-after-ms`.
  - Rationale: the prompt is the interactive replacement for those one-shot local helpers, and rejecting mixed modes avoids competing stdout/stderr and lifecycle timing.
  - Alternative considered: allow all three together. Rejected because it creates ambiguous local behavior without improving product capability.

## Risks / Trade-offs

- [Risk] The prompt could accidentally become a remote-control surface. -> Mitigation: command parser accepts only `status` and `disconnect`, tests assert no host controls or public sends are called, and docs/specs state the safety boundary.
- [Risk] Runtime stop failures could leak local paths or raw exception text. -> Mitigation: prompt failures go through existing sanitized CLI diagnostics.
- [Risk] Future native viewer UI may need richer controls. -> Mitigation: keep this as a development-only CLI surface and require later OpenSpec changes for native UI, media, input, reconnect, or production auth.
