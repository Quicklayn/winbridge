## Context

The viewer local control surface already rejects unsafe local mutation requests
at runtime: `/input` and `/disconnect` require the per-run mutation token,
same-origin `Origin`, and JSON content type before request bodies or viewer
authorization state are read. Existing unit tests cover those server gates.

The MVP smoke workflow currently proves that a happy-path authorized viewer can
serve the frame and send bounded pointer/keyboard input through `/input`. It
does not yet exercise the negative guard path in the same spawned relay, host,
viewer, and surface workflow.

## Goals / Non-Goals

**Goals:**

- Add a fixed smoke subcheck for local viewer surface mutation guard denials.
- Exercise missing token, foreign origin, and unsafe content-type failures
  against the spawned loopback surface.
- Preserve the existing happy-path input and lifecycle-denial checks.
- Keep output bounded and metadata-only.

**Non-Goals:**

- No changes to viewer surface runtime authorization semantics.
- No new HTTP endpoints, browser automation, LAN/public binding, or production
  security model.
- No Windows capture or OS input application changes.

## Decisions

- Add a separate fixed subcheck named `surface-guards`.
  - Rationale: it distinguishes local HTTP mutation guard readiness from frame
    serving (`surface`) and authorized input acceptance (`input`).
  - Alternative considered: fold into `input`; rejected because a denial gate
    regression should be visible as a specific smoke failure.
- Use the existing local `/input` endpoint for all negative probes.
  - Rationale: `/input` is the sensitive mutation path that could send remote
    control input if gates regressed.
  - Alternative considered: also probe `/disconnect`; deferred because input is
    the higher-risk mutation path and disconnect is already non-input.
- Treat only HTTP rejection status as success for guard probes.
  - Rationale: the smoke helper should prove the request failed before becoming
    accepted input, without relying on raw response bodies or private details.

## Risks / Trade-offs

- More smoke HTTP probes can slightly increase smoke runtime.
  - Mitigation: use fixed single-shot probes after the surface is ready.
- Future server status-code changes could require test updates.
  - Mitigation: accept a bounded rejection class rather than exposing raw
    response content.
- Guard checks touch input-path safety.
  - Mitigation: the change only verifies denial behavior and does not weaken
    runtime authorization, consent, or visibility gates.
