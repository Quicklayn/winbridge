## Context

The command kit already emits a relay command that sets
`WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'` for non-loopback LAN relay URLs. Ready
validation should make that contract explicit so a future command-kit change
does not pass readiness while producing a relay command that cannot serve a
two-PC trial.

## Goals / Non-Goals

**Goals:**

- Validate the exact LAN bind host value in command-plan JSON.
- Keep validation bounded and non-executing.
- Keep formatted readiness output free of raw child command text.

**Non-Goals:**

- No command execution.
- No new command-kit flags.
- No network probing or runtime listener checks.
- No changes to relay, host, viewer, capture, input, auth, audit, or native
  adapters.

## Decisions

- Add an `expectedRelayBindHost` parser option used by the LAN ready step.
  - Rationale: localhost command plans do not require a bind override, while
    LAN plans do.
- Require a fixed assignment marker rather than parsing arbitrary PowerShell.
  - Rationale: the command kit emits a reviewed simple command string and ready
    only needs to detect drift.
- Continue reporting only fixed check status.
  - Rationale: relay URLs and commands may contain operator-specific metadata
    and should not be replayed by readiness output.

## Risks / Trade-offs

- A future legitimate command rendering change may require parser updates.
  - Mitigation: command rendering changes are behavior-visible and should carry
    OpenSpec updates and tests.
