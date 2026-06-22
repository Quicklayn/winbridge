# Design: Add MVP Ready Helper

## CLI

`npm run mvp:ready -- [options]`

Options:

- `--json`: emit bounded JSON result.
- `--include-smoke`: also run `npm run mvp:smoke`.
- `--help`: print usage, only as the sole argument.

Malformed, duplicate, or valued flag usage fails closed through bounded usage
diagnostics.

## Execution Model

The helper invokes existing root npm scripts sequentially:

1. `npm run mvp:doctor`
2. `npm run mvp:native-preflight`
3. `npm run mvp:smoke` only when `--include-smoke` is present

Child stdout/stderr is ignored. The helper records only step name and exit
status. It stops on the first failed step so developers get a clear readiness
gate without unrelated follow-on work.

## Output

Text output:

```text
WinBridge MVP readiness passed.
doctor=ok
native-preflight=ok
smoke=skipped
```

JSON output:

```json
{
  "ok": true,
  "checks": [
    { "name": "doctor", "ok": true },
    { "name": "native-preflight", "ok": true },
    { "name": "smoke", "ok": true }
  ]
}
```

Failure JSON includes only bounded reason codes such as `exit-nonzero` or
`spawn-failed`.

## Security Rationale

The helper delegates to existing bounded MVP checks and deliberately suppresses
raw child output. Default mode does not start a live session or smoke runtime.
The explicit `--include-smoke` flag preserves operator intent for the local
static process-spawning smoke check.
