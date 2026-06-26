# Design

## Approach

Add two role-scoped ready steps:

- `lan-role-filter-host-command` for `--role host`
- `lan-role-filter-viewer-command` for `--role viewer`

Each step invokes the existing non-executing command kit with the fixed
representative LAN host `192.168.1.10` and the matching `--only` target. The
parser first reuses the existing target-specific role-filter validation, then
requires the fixed representative LAN relay URL string
`ws://192.168.1.10:8787/` to be present in the filtered output.

## Security Rationale

The ready helper continues to expose only fixed check names and bounded reason
codes. The representative LAN host is not discovered or probed; it is only
used as deterministic parser input, matching the aggregate LAN command-plan
check.

## Alternatives

- Add custom `--relay-host` support to `mvp:ready`. Deferred because it would
  broaden unsafe-input validation for a readiness helper.
- Validate only aggregate JSON LAN output. Already present, but it does not
  prove that the exact per-machine text blocks shown to host/viewer operators
  remain correct.
