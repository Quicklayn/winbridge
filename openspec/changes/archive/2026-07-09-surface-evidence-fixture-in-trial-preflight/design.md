## Context

`mvp:ready -- --include-evidence-fixture` now verifies that the local generated
fixture path can satisfy the strict MVP audit evidence gate. The reviewed
operator surfaces still mention readiness, smoke, Windows control smoke, LAN
probe, and post-run evidence, but they do not yet remind operators to run this
fixture dry run before a live two-PC trial.

## Goals / Non-Goals

**Goals:**

- Add a reviewed preflight reference to
  `npm run mvp:ready -- --include-evidence-fixture`.
- Surface that reference in both `mvp:commands` preflight output and
  `mvp:trial` plan output.
- Keep output bounded and clear that this is a local fixture dry run, not live
  two-PC proof.

**Non-Goals:**

- No change to `mvp:ready` gate behavior or fixture validation semantics.
- No change to `mvp:evidence-fixture` generated record semantics.
- No live trial orchestration, process spawning, relay connection, capture,
  input application, browser automation, log upload, remote log retrieval,
  installer, startup, service, privilege elevation, unattended access, or
  Windows prompt behavior.

## Decisions

1. Add a fixed preflight command reference rather than running the gate.

   Rationale: `mvp:commands` and `mvp:trial` plan mode are reviewed
   non-executing surfaces. They should keep formatting operator workflow text,
   while `mvp:ready -- --include-evidence-fixture` remains the explicit command
   that performs local fixture writes.

2. Use a fixed command string with no user-supplied paths.

   Rationale: the default fixture helper paths are generated and bounded by
   the helper itself. The planning output should not include local fixture
   paths, audit JSONL contents, token values, pairing codes, or full generated
   runtime commands.

3. Keep post-run evidence as the live proof.

   Rationale: generated fixtures can prove the strict gate wiring, but they do
   not prove a live session happened. The trial output must continue to label
   strict post-run evidence as the proof gate for a visible consented two-PC
   trial.

## Risks / Trade-offs

- Generated fixture dry runs may be confused with live evidence -> README and
  trial wording will label the step as local dry run and retain the strict
  post-run evidence step.
- More preflight text can make workflow output longer -> the added line is a
  single fixed command reference and JSON metadata item.
