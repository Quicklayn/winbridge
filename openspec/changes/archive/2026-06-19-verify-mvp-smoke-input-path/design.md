# Design: Verify MVP smoke input path

## Context

The local viewer control surface protects mutating requests with a per-run
token embedded in the generated same-origin HTML and required in the
`x-winbridge-local-surface-token` header. The existing smoke check already
fetches the generated HTML and `/frame` endpoint.

## Approach

The smoke check will:

1. Fetch the local viewer surface HTML.
2. Extract only the generated mutation token assignment.
3. Verify `/frame` as it does today.
4. POST `{"command":"pointer-move 0.5 0.5"}` to `/input` with the required
   `Origin`, `Content-Type`, and token headers.
5. Require a bounded success response: `ok=true`, `action=input`,
   `kind=pointer-move`.

Failure diagnostics remain generic. The token is never printed. The host
process still omits `--host-apply-input true`, so this verifies the viewer
surface and protocol path without invoking native OS input.

## Alternatives

- Use browser automation to click the page: closer to a user path, but higher
  scope and explicitly out of the current smoke-check safety boundary.
- Enable `--host-apply-input true`: closer to full control, but it would invoke
  native OS input and should remain outside a static local smoke check.
