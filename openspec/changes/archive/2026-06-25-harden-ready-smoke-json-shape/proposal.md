## Why

`mvp:ready --include-smoke` consumes the smoke checker's bounded JSON only to
derive fixed aggregate readiness metadata. The parser already rejects loose
smoke subcheck records, but it still tolerates unexpected top-level smoke JSON
fields. Tightening that shape prevents malformed smoke output with raw
metadata from being accepted as ready.

## What Changes

- Reject top-level smoke JSON fields outside the bounded smoke result shape
  accepted by `mvp:ready`.
- Keep accepting the normal `mvp:smoke -- --json` success field
  `artifacts: "cleaned"`.
- Keep the public `mvp:ready` aggregate output unchanged and bounded.

## Capabilities

### Modified Capabilities

- `mvp-session-command-kit`: ready helper smoke JSON parsing is stricter about
  top-level bounded metadata shape.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`.
- Affected workflow: `npm run mvp:ready -- --include-smoke`.
- Security impact: parser/output hardening only. This does not apply OS input,
  invoke capture, launch browsers, change networking, alter authorization,
  persist audit data, handle tokens differently, install services, configure
  startup persistence, elevate privileges, or affect Windows prompts.
