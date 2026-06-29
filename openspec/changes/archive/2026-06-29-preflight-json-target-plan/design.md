# Design

## Approach

`--only preflight --json` will parse to the same internal mode as
`--preflight-only --json` and render through the existing preflight JSON
formatter. This keeps one command list shape:

- `ok: true`
- `mode: "preflight"`
- `nonExecuting: true`
- `commands`: fixed preflight command entries
- `safety`: bounded static strings

The parser will continue to reject `--only <runtime-target> --json` for
`relay`, `host`, `viewer`, and `browser`. It will also reject
`--only preflight --preflight-only` to avoid ambiguous duplicate selectors.

## Readiness Validation

The default `mvp:ready` plan will add a non-executing
`mvp:commands -- --only preflight --json` step. The parser will validate the
same bounded preflight JSON shape and fixed command names used by
`--preflight-only --json`.

Readiness diagnostics will not echo generated command strings, token
references, local URLs, local paths, pairing codes, stdout, stderr, child
output, credentials, screen contents, input contents, clipboard contents, or
full secrets.

## Safety

This change adds only command rendering and JSON validation. It does not create
new remote assistance capabilities or execute printed commands.
