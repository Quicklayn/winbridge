## Context

`npm run mvp:smoke` starts a bounded local static relay/host/viewer workflow and uses the viewer local surface token extracted from the generated HTML to post a single pointer command to `/input`. The smoke host intentionally does not enable `--host-apply-input true`, so the smoke validates protocol and surface readiness without native OS input effects.

## Goals / Non-Goals

**Goals:**

- Validate that the local surface accepts one bounded keyboard command with explicit modifiers after the pointer input check passes.
- Keep the existing check names and public JSON shape stable by treating both commands as the existing `input` check.
- Keep all diagnostics metadata-only and free of raw command lines, keys, modifiers, tokens, and pairing codes.

**Non-Goals:**

- No browser automation or simulated clicks on the rendered page.
- No Windows input adapter invocation or host-side OS input application.
- No text entry, macro execution, clipboard sync, or key capture.

## Decisions

- Add a small reusable `tryPostSurfaceInputCommand()` helper that receives the exact bounded command and expected accepted kind, then returns only a boolean.
- Keep `tryPostSurfaceInput()` as the public pointer helper for existing tests and call the generic helper internally.
- Add `tryPostSurfaceKeyboardInput()` for the bounded keyboard-with-modifier check.
- Run pointer first, then keyboard, inside `waitForViewerSurfaceInput()` so any failure remains the existing `input-not-ready` reason.

## Risks / Trade-offs

- Additional smoke latency -> the check adds one local HTTP POST only.
- Raw keyboard command leakage -> helpers return booleans and formatters keep the same bounded output.
- Confusing the smoke with OS input application -> host command remains without `--host-apply-input true`, and tests assert that invariant.
