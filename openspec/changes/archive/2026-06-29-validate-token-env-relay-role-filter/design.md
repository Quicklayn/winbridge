# Design

## Filtered Token Note

Reuse the full-session token guidance in role-filter text output. When a
filtered command target is rendered with `--token-env <NAME>`, print a static
`Token mode` note before the role-specific command:

- tell the operator to set `$env:<NAME>` to the bounded local relay token;
- state that the token value is referenced through the environment and is not
  printed.

This gives relay-only output a bounded token-env reference without changing the
relay command itself. The command remains `npm run dev:relay` when the token
environment name is already `WINBRIDGE_RELAY_SHARED_TOKEN`, preserving the
existing relay runtime contract where the relay reads that environment variable
directly.

## Ready Validation

Add a `token-role-filter-relay-command` step to:

- the default aggregate ready plan;
- the relay role-scoped ready plan.

Parse it with the existing role-filter markers plus a required
`$env:WINBRIDGE_RELAY_SHARED_TOKEN` reference, while rejecting host/viewer/browser
runtime blocks and raw token literals. This validation must fail closed with
the existing bounded `exit-nonzero` metadata.

## Non-Goals

- Do not require token-env for localhost default command plans.
- Do not alter LAN relay bind behavior.
- Do not print raw token values or add shell logic that reads token values.
- Do not start relay, host, viewer, browser, smoke, capture, or input.
