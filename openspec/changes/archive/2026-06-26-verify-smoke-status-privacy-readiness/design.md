## Context

The local viewer surface `/status` endpoint returns sanitized viewer status for
the generated loopback page. The smoke helper currently uses that endpoint only
to confirm `signalProbeAckReceived=true`. Recent MVP work added bounded
`inputPointerReady` and `inputKeyboardReady` flags so the local page can gate
pointer and keyboard controls without exposing raw permissions.

## Goals / Non-Goals

**Goals:**

- Make the smoke status check require active visible viewer readiness plus
  pointer and keyboard readiness booleans before input checks proceed.
- Reject known unsafe status metadata if it appears in the smoke-consumed
  response.
- Keep the same fixed `signal` smoke subcheck and bounded `signal-not-ready`
  reason.

**Non-Goals:**

- No new status fields or local surface API changes.
- No change to runtime authorization or input sending gates.
- No browser automation, Windows capture, OS input, services, startup
  persistence, privilege elevation, unattended access, clipboard, file
  transfer, diagnostics dump, remote shell, or production deployment behavior.

## Decisions

- Reuse the existing `signal` subcheck instead of adding a new subcheck.
  - Rationale: the smoke stage is already where `/status` readiness is polled;
    strengthening its acceptance criteria avoids ready parser churn.
  - Alternative considered: add `status-privacy` as a separate smoke subcheck.
    Rejected because it would duplicate the same endpoint poll and expand the
    aggregate result shape without improving safety.
- Reject exact unsafe key families recursively while allowing bounded lifecycle
  metadata already exposed by the local surface.
  - Rationale: the smoke helper should catch accidental exposure of high-risk
    fields such as `authorizationId`, `permissions`, `token`, raw signal/input,
    frame, audit, diagnostics, or child-output details while preserving current
    safe fields such as `authorizationStatus` and `expiresAt`.
- Keep output unchanged on failure.
  - Rationale: the safe `signal-not-ready` reason already avoids raw status
    body leakage.

## Risks / Trade-offs

- Future safe status fields with names overlapping the deny-list could be
  rejected by smoke.
  - Mitigation: add future status fields through OpenSpec and update the
    bounded smoke allow/deny contract deliberately.
- Stricter readiness could fail if input permissions are intentionally removed
  from the smoke scenario.
  - Mitigation: the current MVP smoke requests both pointer and keyboard input
    and then verifies both input kinds, so strict status readiness matches the
    workflow.
