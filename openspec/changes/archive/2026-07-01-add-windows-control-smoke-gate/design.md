## Context

`mvp:smoke` already accepts `--windows-capture` and `--windows-input` together.
That combined command starts the local relay, host, and viewer workflow with
the host frame source set to `windows-capture` and host native input application
enabled through `--host-apply-input true`. The smoke helper also has platform
guards for both native boundaries and emits the `windows-input` subcheck only
when native input is explicitly enabled.

The missing piece is a named readiness gate that runs this combined command and
keeps it separate from the safer default and all-smoke paths.

## Goals / Non-Goals

**Goals:**

- Add a named explicit readiness option for combined Windows viewing and
  control evidence.
- Reuse `mvp:smoke -- --windows-capture --windows-input` instead of adding a
  second native execution path.
- Parse the combined smoke JSON with the existing Windows input subcheck shape.
- Keep diagnostics bounded and secret-safe.

**Non-Goals:**

- No new capture adapter, input adapter, browser automation, public relay bind,
  installer behavior, services, startup persistence, elevation, unattended
  access, keylogging, clipboard access, credential access, Windows prompt
  bypass, or hidden session behavior.
- No automatic inclusion in default readiness or `--include-all-smoke`.

## Decisions

1. Add readiness orchestration only, not a new smoke execution mode.
   - Rationale: the existing smoke helper already supports combining the two
     explicit native flags, so a new smoke alias would duplicate behavior and
     increase test surface.
   - Alternative considered: add `mvp:smoke -- --windows-control`. Rejected for
     now because direct composition is clear and keeps the runtime path smaller.

2. Treat the combined step as Windows-input-shaped smoke JSON.
   - Rationale: the smoke JSON adds a `windows-input` subcheck when OS input is
     enabled, while capture is already evidenced by the existing frame check and
     the reviewed command invocation.
   - Alternative considered: add a new `windows-capture` smoke subcheck.
     Rejected because the existing capture smoke contract uses the fixed frame
     subcheck and does not need a new JSON shape.

## Risks / Trade-offs

- The combined gate can move pointer/keyboard state and read the local screen on
  Windows -> keep it explicit, never default, never included in all-smoke, and
  documented as Windows-only.
- Non-Windows CI cannot execute successful native behavior -> test command
  planning, parsing, fail-closed metadata, and direct smoke plan composition;
  Windows operators run the explicit gate locally.
