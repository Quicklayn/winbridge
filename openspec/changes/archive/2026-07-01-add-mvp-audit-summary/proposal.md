## Why

WinBridge can already persist local host/viewer audit JSONL during MVP trials,
but operators do not have a bounded command to verify that a real two-PC run
left the expected consent, visibility, input, revoke, and disconnect evidence.
A read-only audit summary closes that evidence gap without starting runtime
processes or exposing raw log contents.

## What Changes

- Add a root `npm run mvp:audit-summary` helper that reads explicit local host
  and viewer audit JSONL paths.
- Summarize only fixed, metadata-only coverage flags and bounded counts for
  expected MVP evidence.
- Support bounded JSON output for automation.
- Reject unsafe paths, oversized files, malformed JSONL, malformed audit
  records, or unsafe audit content with fixed reason metadata only.
- Document the helper as a local post-run evidence check for development MVP
  trials.

## Capabilities

### New Capabilities

- `mvp-audit-summary`: read-only local audit evidence summary for development
  MVP trials.

### Modified Capabilities

## Impact

- Affected code: new `scripts/mvp-audit-summary.mjs`,
  `scripts/mvp-audit-summary.test.ts`, root `package.json`, README, and
  OpenSpec artifacts.
- Touches audit/log handling and user-visible MVP workflow.
- Does not start relay, host, viewer, browser, capture, input, services,
  startup persistence, unattended access, privilege elevation, network
  listeners, remote log retrieval, log upload, credential access, or Windows
  prompt bypass.
