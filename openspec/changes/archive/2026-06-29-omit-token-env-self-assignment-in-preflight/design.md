# Design

## Preflight Command Rendering

Keep the existing `preflight.ready-all-smoke` command entry and only refine the
token-env command string:

- if `--token-env` is omitted, render `npm run mvp:ready -- --include-all-smoke`;
- if `--token-env <NAME>` is present and `<NAME>` is not
  `WINBRIDGE_RELAY_SHARED_TOKEN`, render the existing environment-reference
  assignment into `WINBRIDGE_RELAY_SHARED_TOKEN`;
- if `--token-env WINBRIDGE_RELAY_SHARED_TOKEN` is present, render only
  `npm run mvp:ready -- --include-all-smoke`.

The operator still receives the token-mode guidance elsewhere in the command
plan, and the all-smoke command remains secret-safe because no raw value is
printed.

## Ready Validation

The ready helper currently validates token-env preflight JSON by matching the
assignment form exactly. Update that parser to accept either:

- the assignment form for alternate bounded token env names; or
- the no-assignment command form when the expected env name is already
  `WINBRIDGE_RELAY_SHARED_TOKEN`.

The parser must still reject missing commands, wrong env names, raw token
literal output, changed command names, malformed JSON, and executing/runtime
command-plan drift.

## Non-Goals

- No changes to smoke execution, relay binding, agent CLI execution, capture,
  input, audit persistence, native Windows wrappers, installer, startup, or
  services.
- No new secret reading or token materialization.
