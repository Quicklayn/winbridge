## Context

`mvp:smoke` starts a bounded same-machine relay, host, and viewer using static
development frames and explicit visible host approval. It checks the viewer
frame output, loopback surface, signal acknowledgement, accepted pointer and
keyboard input through the token-protected `/input` endpoint, and local audit
files. It does not currently exercise a negative lifecycle path after
authorization changes.

## Goals / Non-Goals

**Goals:**

- Add a fixed lifecycle-denial smoke subcheck after the existing input
  acceptance checks.
- Drive existing host lifecycle controls through already available CLI/runtime
  paths.
- Verify that the local viewer surface rejects a bounded input command after
  lifecycle loss of input authorization.
- Keep all output bounded: fixed subcheck names, booleans, and safe reason
  codes only.

**Non-Goals:**

- No new runtime permission model.
- No native Windows capture or OS input.
- No browser automation or browser pointer simulation.
- No LAN discovery, production relay exposure, service/startup/installer,
  privilege elevation, clipboard, file transfer, diagnostics, or unattended
  behavior.

## Decisions

- Add lifecycle-denial checks to the smoke helper instead of a separate script
  so `mvp:ready --include-smoke` gets the same safety signal.
- Use existing terminal/runtime control surfaces where possible. If a helper
  needs a deterministic control path, keep it internal to the smoke workflow
  and avoid printing raw commands or process output.
- Represent the result with a new fixed safe subcheck name such as `lifecycle`
  and preserve the existing bounded JSON shape.

## Risks / Trade-offs

- Lifecycle checks can make smoke slower or more timing-sensitive. Mitigation:
  keep bounded waits and reuse existing polling helpers.
- A single lifecycle subcheck does not prove every revocation scenario.
  Mitigation: focus on the MVP-critical invariant that input fails closed after
  authorization loss, and leave broader lifecycle matrices to later tests.
