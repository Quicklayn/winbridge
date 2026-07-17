## Why

The strict MVP evidence gate currently accepts role-correct audit actions even when they were accumulated across unrelated sessions, and the host records `input-event.applied` before the Windows adapter has succeeded. A live two-PC trial therefore needs stronger, session-bound evidence before it can credibly prove consented native capture and control.

## What Changes

- **BREAKING** Require an explicit expected session id whenever strict MVP evidence is requested, including trial evidence and fixture verification workflows.
- Validate one ordered authorization lifecycle across the host and viewer logs instead of collapsing all accepted records into action booleans.
- Require native capture provenance from an accepted host `screen-capture.requested` event followed by post-adapter `screen-capture.completed` evidence and the matching `screen-frame.sent` event.
- Split viewer frame-output auditing into a fail-closed pre-write request and post-sink `screen-frame.output-written` success; strict evidence MUST require the correlated pair and output failure MUST NOT produce written evidence.
- Split host input auditing into a fail-closed pre-adapter application request and a post-adapter `input-event.applied` success record; adapter rejection MUST NOT produce applied evidence.
- Schedule a metadata-only viewer local-leave disconnect record only after the local connection closes so a real two-PC trial can produce the required viewer evidence without placing synchronous audit I/O on the immediate leave path.
- Reject strict lifecycles that contain revoke, disconnect, expiration, or termination before later native-success milestones.
- Require revoke/disconnect evidence and native capture/input evidence to remain bound to the same session and authorization without exposing those identifiers in output.
- Keep non-strict summaries bounded and metadata-only, and preserve explicit host approval, visible session state, pause/revoke/disconnect controls, and opt-in native input.
- Non-goals: unattended access, hidden sessions or input, persistence, privilege elevation, credential or clipboard access, keylogging, security-prompt bypass, relay changes, or production identity changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-audit-summary`: Bind strict native trial evidence to one expected session, authorization lifecycle, and ordered native capture/input success chain.
- `agent-shell-consent-workflow`: Record capture/input intent before Windows adapters, trusted native success only after adapter success, and local leave evidence outside the immediate disconnect path.
- `mvp-session-command-kit`: Carry the expected session id through trial evidence commands and fixture verification while keeping output redacted and role-scoped plans stable.

## Impact

- Affected code: `scripts/mvp-audit-summary.mjs`, `scripts/mvp-trial.mjs`, `scripts/mvp-evidence-fixture.mjs`, their tests, and the capture, input, frame-output, and local-leave audit paths in `apps/agent-shell/src/runtime.ts` plus integration tests.
- Security-sensitive areas: native capture, native input, authorization correlation, and local audit logs.
- No new dependencies, network behavior, installer/startup/service behavior, token handling, or privilege requirements.
