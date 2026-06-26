# Design

## CLI Parsing

Add a bounded `--role` option that accepts only `relay`, `host`, or `viewer`.
The option may be combined with `--json`, but MUST reject duplicates, missing
values, unknown values, positional values, `--help`, and `--include-smoke`.

## Role Plans

Default mode stays unchanged.

Role mode builds a smaller explicit plan:

- `relay`: `doctor`, `role-filter-relay-command`
- `host`: `doctor`, `native-preflight`, `role-filter-host-command`
- `viewer`: `doctor`, `native-preflight`, `role-filter-viewer-command`,
  `role-filter-browser-command`

Host and viewer keep native preflight because they exercise Windows-side
runtime prerequisites. Relay mode skips native preflight because it only
validates the Node relay command path.

## Output

Text and JSON outputs reuse the existing bounded check result format and do not
echo child output or generated command strings. Role mode does not append smoke
skipped metadata because smoke is outside the role-scoped plan and is rejected
when requested with `--role`.
