## Why

`mvp:ready --include-smoke` intentionally consumes only bounded smoke JSON
metadata. It already strips child output before formatting aggregate readiness,
but the parser should fail closed when a smoke subcheck carries unexpected
fields instead of tolerating a malformed shape.

## What Changes

- Reject smoke subcheck records that include fields other than `name`, `ok`,
  and optional `skipped`.
- Add focused tests proving unexpected fields are rejected and not surfaced.
- Preserve the existing public ready output shape and smoke subcheck names.

## Capabilities

### Modified Capabilities

- `mvp-session-command-kit`: ready helper smoke subcheck parsing is stricter
  about fixed bounded metadata shape.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`.
- Affected workflow: `npm run mvp:ready -- --include-smoke`.
- Security impact: output hardening only. No capture, input application,
  browser automation, networking behavior, authorization, or audit persistence
  changes.
