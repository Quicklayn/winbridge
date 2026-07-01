## Why

The strict MVP audit evidence gate now requires accepted evidence outcomes, but
it still checks the union of host and viewer coverage flags. That can allow an
unexpected role placement to satisfy the post-run gate, for example a viewer log
covering evidence that should only be trusted from the assisted host. A two-PC
MVP pass/fail gate should prove the expected host and viewer roles each
produced their own bounded evidence.

## What Changes

- Require role-bound evidence when `mvp:audit-summary -- --require-mvp-evidence`
  is used.
- Require host-side accepted evidence for authorization approval, active
  authorization, screen frame send, permission revoke, and host disconnect or
  terminal lifecycle.
- Require viewer-side accepted evidence for screen frame output, input send,
  and viewer disconnect.
- Keep the non-strict summary output unchanged for partial troubleshooting.
- Preserve fixed failure reasons and metadata-only output.

## Capabilities

### Modified Capabilities

- `mvp-audit-summary`: strict evidence gate validates expected role placement.

## Impact

- Affected code: `scripts/mvp-audit-summary.mjs`,
  `scripts/mvp-audit-summary.test.ts`, README, and OpenSpec specs.
- Touches audit/log handling only.
- Does not start relay, host, viewer, browser, capture, input, services,
  startup persistence, unattended access, privilege elevation, network
  listeners, remote log retrieval, log upload, credential access, or Windows
  prompt bypass.
