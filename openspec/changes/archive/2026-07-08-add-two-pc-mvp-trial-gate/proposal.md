## Why

WinBridge has strong local readiness and smoke gates, but a two-PC MVP trial
still requires operators to stitch together command-plan, role readiness, and
post-run audit-summary steps from the README. A single read-only trial gate
makes the real Windows-to-Windows MVP path easier to run and easier to verify
without adding unattended access or weakening host consent.

## What Changes

- Add a root `npm run mvp:trial` helper for the manual two-PC development MVP
  workflow.
- In plan mode, print a bounded role checklist that references existing
  `mvp:ready`, `mvp:commands`, and `mvp:audit-summary` commands without
  executing relay, host, viewer, browser, capture, or input.
- In evidence mode, validate explicitly supplied local host and viewer audit
  logs by delegating to the existing strict MVP audit-summary gate.
- Keep diagnostics bounded and avoid echoing raw paths, relay URLs, pairing
  codes, token values, generated commands, stdout, stderr, audit records, frame
  bytes, screen contents, or input contents.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: adds a read-only two-PC MVP trial helper that
  assembles existing readiness, command-plan, and audit-summary gates into one
  explicit operator workflow.
- `mvp-audit-summary`: the strict audit evidence gate is reused as the
  required post-run verifier for the two-PC trial helper.

## Impact

- Affected code: root `package.json`, a new `scripts/mvp-trial.mjs`, focused
  tests, README, and OpenSpec artifacts.
- Touches logs only through explicit local audit file inputs in evidence mode;
  it does not retrieve remote logs or upload artifacts.
- Does not add or change capture, input, auth, relay runtime behavior,
  installer behavior, startup, services, tokens, privilege elevation, browser
  automation, unattended access, hidden sessions, credential access,
  keylogging, clipboard access, AV/EDR evasion, or Windows prompt bypass.
- Safety impact: improves operator safety by making consent, visible-session,
  revocation, disconnect, and role-bound audit evidence explicit before the
  project is treated as MVP-ready on two Windows PCs.
