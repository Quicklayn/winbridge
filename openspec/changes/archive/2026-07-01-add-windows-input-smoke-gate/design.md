## Context

WinBridge already has a reviewed `@winbridge/windows-input` adapter and
agent-shell runtime wiring behind `--host-apply-input true`. The root
`mvp:smoke` currently verifies local relay, host consent, visible active
session state, host/viewer browser surfaces, frame delivery, protocol input
send, audit, revocation, and disconnect. It intentionally omits OS input so
the default smoke remains safe on any developer machine.

MVP needs a separate proof path that can be run on a Windows host before a
two-PC trial to demonstrate consent-bound native input application.

## Goals / Non-Goals

**Goals:**

- Add a Windows-only, opt-in native input smoke gate.
- Keep default `mvp:smoke` and `mvp:ready -- --include-all-smoke` from applying
  OS input.
- Use existing runtime authorization, visible-session checks, audit sink, and
  Windows input adapter rather than adding a second input path.
- Keep diagnostics bounded and secret-safe.

**Non-Goals:**

- No unattended input, hidden input, hidden capture, startup persistence,
  services, installer behavior, privilege elevation, Windows prompt bypass,
  credential access, clipboard access, keylogging, or AV/EDR evasion.
- No browser automation or public relay binding.
- No production remote-control UI changes.

## Decisions

1. Add a dedicated `--windows-input` smoke flag instead of reusing
   `--windows-capture`.
   - Rationale: capture and input have different safety profiles; operators
     should opt into each native boundary independently.
   - Alternative considered: enable input whenever `--windows-capture` is set.
     Rejected because capture validation should not unexpectedly move the host
     pointer or apply keys.

2. Reuse the existing protocol input step and host audit evidence.
   - Rationale: the viewer already sends a bounded input event under an active
     authorization, and the host runtime emits
     `agent-shell.remote-interaction.input-event.applied` only when native
     application is attempted after authorization checks.
   - Alternative considered: add a separate synthetic native input test path.
     Rejected because it would bypass the same route used by real sessions.

3. Fail closed before startup off Windows.
   - Rationale: the native adapter is Windows-only; starting relay/host/viewer
     before determining platform support would create misleading readiness
     evidence.
   - Alternative considered: start the workflow and let the adapter fail.
     Rejected because it would leave partial smoke effects and less precise
     diagnostics.

## Risks / Trade-offs

- Applying OS input can affect the local Windows desktop -> keep it opt-in,
  bounded to the existing single smoke input event, visible to the host, audited,
  and never part of default smoke.
- Audit evidence proves the runtime invoked the authorized adapter, not that a
  human observed cursor movement -> acceptable for automated MVP gating; manual
  two-PC trial can still inspect host behavior directly.
- Platform-specific validation cannot run in non-Windows CI -> non-Windows tests
  cover planning, parsing, and fail-closed behavior; Windows operators run the
  explicit smoke locally.
