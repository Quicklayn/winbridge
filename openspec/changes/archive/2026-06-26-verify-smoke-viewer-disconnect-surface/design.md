## Context

The viewer local control surface already exposes `POST /disconnect` on
loopback. That route is protected by the same per-run mutation token, same
origin, and JSON content-type checks as `/input`, and then calls the viewer
runtime `leave()` path. The current MVP smoke workflow proves the surface,
guard denials, accepted pointer/keyboard input, audit evidence, and lifecycle
input denial, but it does not exercise `/disconnect`.

## Goals / Non-Goals

**Goals:**

- Add an end-to-end smoke subcheck for the viewer local surface disconnect
  path.
- Keep smoke and ready output bounded to fixed subcheck names and safe reason
  codes.
- Reuse the existing surface mutation token and same-origin request helper
  pattern.
- Keep runtime disconnect behavior unchanged.

**Non-Goals:**

- No new remote control command or protocol message.
- No change to host-side pause, revoke, terminate, or disconnect controls.
- No browser automation, OS input, Windows capture, services, startup
  persistence, privilege elevation, unattended access, clipboard, file
  transfer, diagnostics dump, remote shell, or production deployment behavior.

## Decisions

- Add `viewer-disconnect` as a fixed smoke subcheck after lifecycle denial.
  - Rationale: the check should prove explicit viewer exit after the other MVP
    evidence is collected, while avoiding disruption of frame, input, audit,
    and lifecycle readiness checks.
  - Alternative considered: use `/disconnect` as the lifecycle-denial trigger.
    Rejected because lifecycle denial currently proves host-side permission
    revocation; replacing it would reduce consent/revocation coverage.
- Validate only the exact safe success response shape needed by smoke:
  `202` with `{ ok: true, action: "disconnect" }`.
  - Rationale: smoke needs a bounded readiness assertion, not raw response
    detail.
  - Alternative considered: accept any 2xx response. Rejected because it would
    miss route drift.
- Teach ready to accept exactly the expanded fixed subcheck set.
  - Rationale: ready should continue rejecting missing, duplicate, malformed,
    or unexpected smoke metadata without exposing unsafe output.

## Risks / Trade-offs

- Running disconnect too early could mask audit or lifecycle checks.
  - Mitigation: run it after audit summary and lifecycle denial have passed.
- A disconnect failure could leave child processes running until cleanup.
  - Mitigation: use the existing smoke `finally` cleanup path and bounded
    `viewer-disconnect-not-ready` reason.
- Expanding the fixed subcheck set requires synchronized smoke and ready tests.
  - Mitigation: update smoke formatter tests and ready parser tests together.
