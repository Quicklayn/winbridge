# Design

## Approach

When `createRoleMvpReadyPlan("viewer")` builds role-scoped steps, append the
same `ephemeral-role-filter-browser-command` used by the aggregate ready plan:

```text
npm run mvp:commands -- --only browser --viewer-control-surface-port 0
```

No new parser is needed. `runMvpReadyCheck()` already recognizes that step name
and validates it through `parseEphemeralBrowserRoleFilteredCommandReadiness()`.

## Security Rationale

The viewer role-scoped gate remains read-only and non-executing. It validates
operator instructions without opening a browser, resolving ports, connecting to
the relay, or handling local mutation tokens. Failure output continues to show
only fixed check names and bounded reason codes.

