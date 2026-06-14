# Design: Direct scheduler delay bounds

## Overview
The direct scheduler helpers are small wrappers around `setTimeout()`. They should fail before scheduling when called with malformed delay values. A shared helper keeps the validation behavior consistent across host status, viewer status, and viewer local disconnect scheduling.

## Approach
- Add an agent-shell local timer delay helper with the same finite maximum used by safe JavaScript timers.
- Validate direct `delayMs` values with `Number.isInteger(delayMs)`, lower bound `0`, upper bound `2_147_483_647`, and finite number behavior before creating any timer.
- Import the guard in `host-status.ts`, `viewer-status.ts`, and `viewer-disconnect.ts`.
- Keep valid zero-delay and positive-delay scheduling behavior unchanged.
- Throw a bounded generic error for invalid direct scheduler inputs and do not write raw delay text to output streams.

## Security Rationale
Status reads and local leave are non-authorizing local operations, but malformed timers should still fail closed. This prevents accidental immediate status reads or local disconnects caused by JavaScript timer coercion while preserving the existing consent, authorization, host visibility, and audit boundaries.

## Compatibility
CLI users should see no behavior change because CLI parsing already rejects malformed timer options. Direct helper callers using valid integer delays remain compatible. Direct helper callers using malformed numeric delays now receive an error before any timer or runtime side effect is created.

## Alternatives Considered
- Rely only on CLI parsing: rejected because the scheduler helpers are exported and tested as direct APIs.
- Clamp invalid values: rejected because clamping could hide caller bugs and cause surprising execution timing.
