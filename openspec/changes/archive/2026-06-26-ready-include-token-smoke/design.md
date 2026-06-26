# Design: Explicit tokenized smoke readiness aggregation

## Approach
`mvp:ready` will parse a new `--include-token-smoke` flag. In default aggregate
mode, this flag appends one step named `token-smoke`:

```text
npm run mvp:smoke -- --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN
```

The ready helper already sanitizes smoke JSON into fixed check metadata and
safe audit summaries. The new step reuses the same parsing path by treating
`token-smoke` as a smoke step.

## Compatibility
`--include-smoke` keeps its current behavior: default smoke plus LAN-style
smoke. `--include-token-smoke` is independent and explicit, so developers can
run only tokenized smoke aggregation or combine all smoke modes.

Role-scoped ready remains non-smoke and MUST reject `--include-token-smoke`, as
role checks are intended for each machine before a live trial and should not
start local relay/host/viewer smoke children.

## Failure Behavior
If the required environment variable is missing or malformed, the smoke helper
exits with bounded JSON usage metadata. Ready reports only the fixed
`token-smoke` check failure and sanitized subchecks when available. It must not
echo environment names as secret values, raw token values, child output, command
strings, or process environment maps.

