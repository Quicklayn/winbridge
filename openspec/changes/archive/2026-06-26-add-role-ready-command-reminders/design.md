# Design

## Approach

Filtered command rendering will map each `--only` target to the local readiness
role that should be run on the same machine:

- `relay` -> `npm run mvp:ready -- --role relay`
- `host` -> `npm run mvp:ready -- --role host`
- `viewer` -> `npm run mvp:ready -- --role viewer`
- `browser` -> `npm run mvp:ready -- --role viewer`

`preflight` remains the aggregate preflight command block because it is not a
single-machine runtime block.

`mvp:ready` already validates role-filtered command output without surfacing
the generated block. Its target-specific marker set will be updated to require
the matching role reminder while preserving existing forbidden-marker checks.

## Security Rationale

The change reduces operator ambiguity without expanding capability. The helper
continues to print commands only and the readiness helper continues to inspect
bounded output internally without echoing command text, relay URLs, local URLs,
paths, pairing codes, tokens, stdout, stderr, or child output.

## Alternatives

- Leave the generic reminder unchanged. Rejected because it makes role-scoped
  readiness harder to discover at the exact point an operator uses a filtered
  command block.
- Add role reminders to the full command plan. Rejected for this increment
  because the full plan intentionally remains an aggregate ordered workflow.
