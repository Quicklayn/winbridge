## Why

The MVP smoke check currently emits bounded audit summary metadata, but its
internal audit readiness can still be satisfied by parseable partial logs. The
automated "view and control" smoke path should fail closed unless the local
host and viewer audit logs prove the same role-bound MVP evidence required by
the post-run audit gate.

## What Changes

- Require the MVP smoke check to validate strict role-bound host/viewer audit
  evidence before reporting the audit subcheck as passed.
- Reuse the existing bounded `audit-not-ready` failure path for missing,
  malformed, denied, failed, or wrong-role evidence.
- Keep smoke human and JSON output metadata-only and extend the bounded audit
  summary only with the fixed `disconnectObserved` boolean.
- Add regression coverage for missing disconnect evidence, denied/failed
  outcomes, and wrong-role evidence in smoke audit summaries.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: smoke audit readiness must require strict
  role-bound MVP audit evidence.
- `mvp-audit-summary`: strict host disconnect evidence must include the
  existing host-local `agent-shell.session.disconnected` audit action.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-audit-summary.mjs`, and focused smoke/audit tests.
- Affected docs/specs: README, `openspec/specs/mvp-session-command-kit`, and
  `openspec/specs/mvp-audit-summary`.
- Touches local audit/log handling only.
- Does not start new processes beyond the existing explicit smoke workflow, add
  capture or input behavior, change relay/auth protocols, install services,
  configure startup persistence, add unattended access, elevate privileges,
  retrieve remote logs, upload logs, access credentials, or bypass Windows
  prompts.
