# Design

## Approach

Add one relay role-scoped ready step named `lan-role-filter-relay-command`.
The step invokes the existing non-executing command kit with a fixed safe
representative relay host:

```text
npm run mvp:commands -- --only relay --relay-host 192.168.1.10
```

The parser reuses the existing relay role-filter markers and adds an internal
LAN bind requirement for this step:

- the output must still be the relay-only filtered block;
- it must include the reviewed PowerShell environment marker
  `WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'`;
- it must not include host, viewer, browser, or preflight command blocks.

## Security Rationale

The change improves the relay operator's local preflight confidence without
executing any command. The fixed LAN host is the same representative value used
by the aggregate ready helper and is used only as parser input. Readiness
formatting continues to expose only fixed check names and safe reason codes.

## Alternatives

- Add a general `mvp:ready -- --role relay --relay-host ...` option. Deferred:
  this would broaden the ready CLI and require additional unsafe-input
  validation. A fixed representative check is smaller and matches the current
  aggregate ready pattern.
- Reuse the aggregate `lan-command-plan` in relay role mode. Rejected because
  it validates the full JSON plan instead of the exact relay-only operator
  block shown to the relay machine.
