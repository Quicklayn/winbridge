# Change: Bound direct host consent prompt timeout

## Why
The agent-shell CLI and managed runtime validate host consent timeout values before startup. The exported interactive host consent prompt helper still accepts raw numeric `timeoutMs` values and passes them directly to `setTimeout()`. JavaScript timer coercion can turn malformed values such as `0`, `NaN`, negative numbers, fractions, or oversized values into surprising immediate or clamped prompt timeout behavior.

Direct prompt callers should receive the same fail-closed timeout boundary before any host-facing prompt output or consent decision wait begins.

## What Changes
- Add a positive bounded timeout guard for direct interactive host consent prompt options.
- Reject zero, non-integer, negative, non-finite, and timer-unsafe timeout values before creating prompt timers or rendering prompt text.
- Keep the default timeout and valid positive timeout behavior unchanged.
- Add focused tests that invalid direct timeouts do not render host prompt metadata.

## Safety Impact
- Touches the interactive host consent prompt helper and focused tests.
- Does not change relay behavior, protocol schemas, authorization grants, pairing, audit persistence, capture, input, installer, startup, services, tokens, logs, or privilege behavior.
- Strengthens consent-first safety by preventing malformed local prompt timeouts from causing unexpected approval prompt behavior.

## Non-Goals
- No new remote access capability.
- No hidden sessions, stealth persistence, credential access, keylogging, AV/EDR evasion, or Windows prompt bypass.
- No change to valid CLI timeout parsing, valid direct positive timeout behavior, host approval semantics, denial semantics, visible-session requirements, or audit emission timing.
