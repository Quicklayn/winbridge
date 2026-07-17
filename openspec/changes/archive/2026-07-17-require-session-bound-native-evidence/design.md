## Context

The strict MVP audit gate currently reduces accepted host and viewer records to
role-scoped booleans. Because development audit files are append-only, records
from unrelated sessions can satisfy one check. The host input path also writes
`input-event.applied` before the Windows adapter returns, so an adapter failure
can leave false native-success evidence.

This change crosses the local audit summary, trial/fixture command helpers, and
the security-sensitive agent-shell capture/input audit path. It must preserve
explicit host approval, visible active state, immediate pause/revoke/disconnect,
metadata-only logs, and opt-in native input. No production identity or network
protocol is introduced.

## Goals / Non-Goals

**Goals:**

- Make strict evidence prove one expected session and one authorization
  lifecycle instead of unrelated action presence.
- Correlate capture request/completion/frame delivery, viewer output
  request/success, and viewer input/host application by bounded identifiers
  while keeping those identifiers out of output.
- Treat `input-event.applied` as post-adapter success evidence only.
- Keep non-strict summaries and all failures bounded, deterministic, and
  metadata-only.
- Update generated commands and deterministic fixtures so the stricter gate is
  executable in local and two-PC trial workflows.

**Non-Goals:**

- Unattended access, hidden sessions or input, persistence, privilege
  elevation, credential or clipboard access, keylogging, AV/EDR evasion, or
  Windows prompt bypass.
- Relay, transport, installer, startup, service, token, or production identity
  changes.
- Inferring a session or authorization from historical logs when strict mode is
  requested.

## Decisions

### Strict evidence requires an explicit expected session

`--require-mvp-evidence` will require `--session <session-id>`. Trial evidence
and fixture verification will pass that value explicitly. Non-strict summary
mode remains available without it.

Alternative considered: infer the newest session from timestamps. This was
rejected because it is ambiguous with reused/merged logs and makes the gate
dependent on clock quality.

### Correlation is internal and output remains fixed

The parser will retain safe `sessionId`, `detail.authorizationId`, frame, event,
and sequence identifiers only for in-memory validation. Text and JSON output
will continue to expose only fixed role counts, coverage flags, failure
reasons, and fixed `host.<flag>`/`viewer.<flag>` missing markers.

Alternative considered: print correlation identifiers for diagnosis. This was
rejected because local audit identifiers can expose operational metadata and
the existing helper contract is intentionally redacted.

### Validate per-log order and cross-log identity, not wall-clock order

Within each role log, strict validation will require consent and native-effect
events in record order. Across host and viewer logs, matching authorization,
frame, event, and sequence identifiers will establish correlation. The gate
will not compare timestamps between PCs.

Alternative considered: require globally increasing timestamps. This was
rejected because two development PCs may have clock skew even when the same
session is valid.

### Native capture requires post-adapter success provenance

A host `screen-frame.sent` record is strict evidence only when an earlier
accepted host `screen-capture.requested` record is followed by matching
`screen-capture.completed` evidence written after the Windows adapter returns.
All three records must have the same expected session, authorization, frame id,
and sequence. Viewer frame output must match that frame. A generic send after a
failed native adapter therefore cannot satisfy strict capture provenance.

### Viewer frame output uses request-before and success-after audit records

The viewer will persist
`agent-shell.remote-interaction.screen-frame.output-requested` before invoking
its explicit latest-frame sink. Failure to persist that request blocks the
write. `screen-frame.output-written` will be persisted only after the sink
successfully publishes the complete frame, so strict viewer output evidence
cannot survive a failed file write. Strict validation requires the matching
request record before the written record; a legacy standalone written action
is not trusted success evidence.

Alternative considered: retain the pre-write `output-written` record and rely
on later input evidence. This was rejected because strict capture evidence
must independently prove that the viewer published a complete frame.

### Native input uses intent-before and success-after audit records

The host will persist
`agent-shell.remote-interaction.input-event.application-requested` before
calling the Windows adapter. Failure to persist that record blocks the adapter.
Only after the adapter succeeds will the host persist
`agent-shell.remote-interaction.input-event.applied`. Adapter rejection will
therefore never produce applied evidence.

Alternative considered: keep the existing pre-adapter `applied` action and add
a second status field. This was rejected because old readers can still mistake
the action itself for trusted success.

### Consent lifecycle records carry the authorization correlation id

Host approval, activation, permission revocation, capture, input, and
disconnect records will carry the same bounded authorization id in audit
detail. Strict evidence will fail for legacy or malformed records that do not
provide the required correlation. The id is never rendered by summary or trial
output.

### Terminal lifecycle records stop strict progression

Strict host validation scans one authorization lifecycle in record order.
Pause prevents native milestones until a matching resume. Revocation,
disconnect, expiration, or termination before a later required native
milestone stops that candidate lifecycle; later positive actions cannot revive
it. The required final revoke and disconnect remain terminal tail milestones.

### Viewer leave records disconnect evidence after closing

When an authorized viewer invokes local `leave()`, the runtime will attempt a
metadata-only `agent-shell.session.disconnected` record from a deferred
best-effort callback only after local socket closure completes. Audit failure
is reported best-effort and MUST NOT block or delay the viewer's local
disconnect control. The record carries the captured authorization correlation
but no private reason or runtime payload.

Alternative considered: keep accepting synthetic `viewer.disconnect.sent`
records only. This was rejected because the real viewer runtime would still be
unable to satisfy the strict trial gate.

## Risks / Trade-offs

- **Older audit logs fail strict verification** -> Non-strict summary remains
  compatible; fixtures and generated trial commands are updated together.
- **Post-adapter audit persistence can fail after Windows input occurred** ->
  The runtime reports bounded failure and strict evidence fails; it does not
  falsely claim success. The pre-adapter record still provides intent/audit
  trace.
- **Post-output audit persistence can fail after a frame was published** -> The
  runtime reports bounded failure and strict evidence fails rather than
  claiming a trusted published frame.
- **Post-capture audit persistence can fail after screen bytes were captured**
  -> The runtime reports bounded failure and does not send the frame or claim
  trusted native completion.
- **Viewer leave audit can fail** -> Local leave still closes immediately;
  strict evidence fails rather than trapping the viewer in a session.
- **Reused frame or event identifiers could create false correlation** -> The
  gate additionally binds role, expected session, authorization, sequence,
  request/success pairs, terminal barriers, and per-log ordering.
- **Additional detail fields increase local metadata** -> Only bounded ids and
  status/count metadata are persisted; no frame bytes, coordinates, keys,
  reasons, tokens, or credentials are added.

## Migration Plan

1. Update runtime audit semantics and focused integration tests.
2. Update strict summary correlation and redaction tests.
3. Update trial, fixture, command-kit, and readiness commands to pass the
   expected session explicitly.
4. Regenerate/verify deterministic fixtures and run all repository gates.
5. Archive this OpenSpec change after strict validation. Rollback is a normal
   source revert; no persisted schema migration or network rollout is needed.

## Open Questions

None. The development-only evidence contract is fully specified by this
change; production identity and signed attestations remain future work.
