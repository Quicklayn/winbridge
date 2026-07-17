## Why

The default MVP smoke run now writes and independently summarizes canonical
viewer local-leave evidence as accepted `agent-shell.session.disconnected`, but
the strict viewer role action map recognizes only the older
`agent-shell.viewer.disconnect.requested` and `.sent` actions. The audit gate
therefore returns `audit-not-ready` even though the expected viewer-local
disconnect record exists and the separate audit-summary command accepts it.

## What Changes

- Recognize accepted `agent-shell.session.disconnected` as viewer-local
  `disconnectObserved` evidence in the strict smoke role map.
- Preserve the existing accepted-outcome requirement, role-local host/viewer
  audit file separation, required evidence flags, content bounds, parsing
  behavior, and bounded diagnostics.
- Add focused tests proving canonical viewer local-leave evidence passes while
  denied, failed, missing, and wrong-role evidence still fail closed.
- Retain compatibility with the existing viewer disconnect requested/sent
  actions and rerun the exact default MVP smoke workflow.

## Capabilities

### Modified Capabilities

- `mvp-session-command-kit`: align strict viewer disconnect evidence mapping
  with the canonical local viewer leave audit action already emitted by the
  runtime and accepted by the audit-summary verifier.

## Impact

Expected code changes are limited to `scripts/mvp-session-smoke.mjs`, its
focused tests, documentation if needed, and OpenSpec artifacts. This verifier
change does not alter runtime consent, authorization, host visibility, relay
traffic, disconnect behavior, capture, input, native Windows APIs, installer,
service, startup, persistence, privilege, or protocol schemas.
