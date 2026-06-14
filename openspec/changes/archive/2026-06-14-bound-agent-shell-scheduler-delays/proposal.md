# Change: Bound direct agent-shell scheduler delays

## Why
The agent-shell CLI already validates timer delay options before runtime startup. The direct scheduler helpers for host status printing, viewer status printing, and viewer local disconnect still accept raw numeric `delayMs` values and pass them directly to `setTimeout()`. JavaScript timer coercion can turn malformed values such as `NaN`, negative numbers, fractions, or oversized values into surprising immediate or clamped execution.

Direct helper callers should receive the same fail-closed timer boundary as the CLI path before any status read, local leave, runtime control, or protocol send can happen.

## What Changes
- Add a shared local scheduler delay guard for agent-shell direct scheduler helpers.
- Reject non-integer, negative, non-finite, and timer-unsafe delay values before scheduling host status print, viewer status print, or viewer local disconnect.
- Add focused tests that invalid delays do not call runtime status, local leave, controls, public sends, or write prompt output.

## Safety Impact
- Touches agent-shell local scheduler helpers and focused tests.
- Does not change relay behavior, protocol schemas, authorization grants, pairing, audit persistence, capture, input, installer, startup, services, tokens, logs, or privilege behavior.
- Strengthens consent-first safety by preventing malformed local timer values from causing unexpected status reads or viewer local disconnect operations.

## Non-Goals
- No new remote access capability.
- No hidden sessions, stealth persistence, credential access, keylogging, AV/EDR evasion, or Windows prompt bypass.
- No change to valid CLI timer parsing, valid direct zero-delay scheduling, authorization lifecycle semantics, host visibility requirements, or audit emission timing.
