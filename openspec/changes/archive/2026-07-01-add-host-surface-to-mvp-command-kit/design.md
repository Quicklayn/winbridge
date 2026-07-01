## Context

The MVP command kit is a non-executing helper that prints reviewed PowerShell
commands for a two-PC development trial. The host agent shell already supports
an opt-in loopback-only host local control surface, but the command kit and
readiness checks do not yet include that option in the reviewed host command.

## Goals / Non-Goals

**Goals:**

- Make the reviewed host command include `--host-control-surface-port`.
- Default the generated host surface port to `0` so the host process resolves
  a loopback-only ephemeral port and logs the actual URL.
- Validate the new option in readiness checks for full, LAN, token, and
  role-filter command plans.
- Keep output bounded and secret-safe.

**Non-Goals:**

- Do not start the host local surface from the command kit or readiness helper.
- Do not launch a browser on the host machine automatically.
- Do not change runtime consent, authorization, audit, capture, or input
  semantics.
- Do not add unattended access, persistence, service installation, privilege
  elevation, Windows prompt bypass, keylogging, clipboard access, or LAN-bound
  control surfaces.

## Decisions

- Use `0` as the command-kit default host surface port. This avoids fixed-port
  collisions during two-PC trials and relies on the already reviewed host
  runtime to log the resolved `127.0.0.1:<port>` URL.
- Reuse the existing bounded local-surface port parser for host and viewer
  ports. The accepted range stays `0` or `1024..65535`, rejecting privileged,
  malformed, duplicate, blank, fractional, negative, oversized, or unsafe
  inputs before command rendering.
- Add readiness validation markers rather than executing host surface probes.
  `mvp:ready` remains a static, non-executing readiness gate; live host surface
  behavior remains covered by agent-shell tests and smoke paths where
  appropriate.
- Keep host surface instructions textual. The helper tells the host operator to
  open the URL printed by the host command log instead of fabricating a URL for
  ephemeral port `0`.

## Risks / Trade-offs

- Host operators must copy the runtime-printed URL manually when the port is
  ephemeral. Mitigation: the command plan and role-filter hints call this out
  beside the host command.
- Static readiness can only detect command-plan drift, not runtime listener
  failures. Mitigation: runtime host surface behavior is tested in
  `agent-shell`; this change intentionally keeps `mvp:ready` side-effect free.
- Adding another host command option increases command length. Mitigation:
  focused tests validate the reviewed command shape and failure behavior.
