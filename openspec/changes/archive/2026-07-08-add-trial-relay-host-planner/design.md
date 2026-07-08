## Context

`mvp:trial` prints the high-level two-PC operator workflow and keeps generated
runtime commands out of its output. `mvp:commands` already owns concrete relay,
host, viewer, and browser command rendering, including validation for LAN
relay host shortcuts and token-env references. The gap is that the trial helper
always uses `<relay-pc-lan-ip>` placeholders in its command references.

## Goals / Non-Goals

**Goals:**

- Accept a validated relay-host shortcut in trial plan mode.
- Substitute that host into the existing role command-reference strings.
- Keep the helper non-executing, bounded, and secret-safe.
- Preserve compatibility for existing placeholder output when no relay host is
  supplied.

**Non-Goals:**

- No generated host/viewer/browser runtime command output in `mvp:trial`.
- No relay URL output, pairing code output, local control URL output, token
  value output, or audit content output.
- No evidence-mode relay-host argument.
- No changes to relay, host, viewer, capture, input, authorization, audit
  record semantics, installer behavior, startup persistence, services, or
  production UI.

## Decisions

1. Reuse command-kit relay-host validation semantics in `mvp:trial`.
   - Rationale: the allowed relay-host shape should match the command kit that
     operators will use next.
   - Alternative considered: accept any string and leave validation to
     `mvp:commands`. Rejected because the top-level workflow should fail closed
     before printing misleading command references.

2. Keep trial output as command references, not generated commands.
   - Rationale: `mvp:commands` remains the single source of concrete runtime
     command rendering and already has detailed safety checks.
   - Alternative considered: add a `--commands` mode to `mvp:trial`. Rejected
     for this increment because it would duplicate more sensitive output paths
     and increase accidental sharing risk.

3. Do not support `--relay-host` in evidence mode.
   - Rationale: evidence mode only reads explicit audit files and should not
     accept unrelated network planning inputs.

## Risks / Trade-offs

- Host string leakage in plan output -> the operator explicitly supplies the
  relay host, and output is still bounded to command-reference text without
  relay URLs, generated runtime commands, pairing codes, local URLs, tokens, or
  audit contents.
- Parser drift between `mvp:ready` and trial output -> update readiness parser
  to accept both placeholder default output and validated relay-host plan
  output where applicable, while default readiness continues to validate the
  placeholder form.
