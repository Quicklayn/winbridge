## Context

The development relay already supports `WINBRIDGE_RELAY_SHARED_TOKEN`. The MVP
command kit, smoke helpers, and foreground role runner expose operator-facing
`--token-env <NAME>` controls so raw relay tokens are not typed into high-level
commands or printed in plans.

The remaining gap is `dev:agent`: host/viewer processes currently accept only
`--token <VALUE>`. That forces wrappers such as `mvp:run` and smoke helpers to
resolve the token and pass it as child argv even when their own public interface
is env-name based.

## Goals / Non-Goals

**Goals:**

- Add a bounded `--token-env <ENV_NAME>` option to `dev:agent`.
- Resolve the token from the named environment variable inside agent parsing.
- Reuse existing token value validation and output redaction behavior.
- Reject ambiguous use of both `--token` and `--token-env`.
- Update MVP command and runner surfaces to prefer agent `--token-env` over raw
  child `--token` argv.

**Non-Goals:**

- No production credential, account, identity, token lifecycle, rotation, or
  secure storage design.
- No removal of `--token` in this increment.
- No change to relay token verification, wire protocol behavior, consent,
  visible session state, capture, input, audit, or authorization semantics.
- No background service, unattended access, privilege elevation, firewall
  changes, browser launch, stealth persistence, credential access, keylogging,
  AV/EDR evasion, or Windows prompt bypass.

## Decisions

1. Add `--token-env` directly to agent-shell argument parsing.

   Rationale: wrappers should not need to resolve token values into argv. The
   runtime already receives an optional token string; changing the parser keeps
   runtime behavior stable while reducing command-line secret exposure.

   Alternative considered: teach only `mvp:run` to pass token through child
   environment while leaving `dev:agent` unchanged. That still leaves the
   agent entrypoint without a reviewed env-only path and does not help printed
   operator commands.

2. Reuse existing token value validation for env-resolved tokens.

   Rationale: relay token constraints already cover blank, untrimmed,
   oversized, control-character, bidi, and zero-width unsafe values. Reuse
   avoids two subtly different token policies.

   Alternative considered: accept any environment value and let relay reject.
   That delays failure until after runtime startup and can expose worse
   diagnostics.

3. Keep `--token` temporarily but make it mutually exclusive with
   `--token-env`.

   Rationale: compatibility stays intact for existing tests and direct
   development use, while new reviewed MVP surfaces move to env-only token
   intake. Ambiguous dual input would make precedence unclear and is rejected.

4. Make dry-run/readiness metadata require agent `--token-env` markers.

   Rationale: the MVP readiness gates should catch regression back to raw
   child token argv before live two-PC use.

## Risks / Trade-offs

- [Risk] Operators may confuse relay `WINBRIDGE_RELAY_SHARED_TOKEN` and a
  custom agent token-env name. -> Mitigation: docs and command kit examples use
  the same fixed env name for relay, host, and viewer terminals.
- [Risk] Legacy `--token` remains available. -> Mitigation: the reviewed MVP
  command/runner/readiness path moves to `--token-env`; removing `--token` can
  be a later compatibility-breaking hardening change.
- [Risk] Env variables still expose secrets to local processes with sufficient
  user access. -> Mitigation: this is a development MVP hardening step, not a
  production secret-management solution, and it materially reduces argv/history
  exposure in the current workflow.
