## MODIFIED Requirements

### Requirement: MVP audit summary emits bounded evidence only

The MVP audit summary helper SHALL summarize accepted local audit JSONL into
fixed role-scoped counts and fixed evidence flags only. The fixed evidence
flags MUST include authorization approved, active visible authorization,
screen capture requested, screen capture completed, screen frame sent, screen
frame output, input sent, input applied, permission revoked, and disconnect or terminal lifecycle
evidence when present in safe audit action/outcome metadata. Text and JSON
output MUST NOT include raw audit record details, event ids, actor ids, target
ids, session ids, authorization ids, display names, private reasons, pointer
coordinates, key values, frame bytes, screen content, input content, clipboard
content, file-transfer content, diagnostic content, tokens, pairing codes,
credentials, local paths, command strings, stdout, stderr, or full secrets.

#### Scenario: Successful summary reports fixed evidence

- **WHEN** host and viewer audit logs contain schema-like safe MVP audit
  records for approval, active visible authorization, capture request and completion, frame
  send/output, input send/application, revocation, and disconnect lifecycle
  evidence
- **THEN** the helper reports `ok=true`, bounded role counts, and fixed
  coverage flags
- **AND** it does not print raw audit details or identifiers

#### Scenario: JSON summary remains bounded

- **WHEN** the developer runs the helper with `--json`
- **THEN** the helper emits machine-readable metadata containing only `ok`,
  `roles`, and `coverage`
- **AND** the JSON omits raw audit records, paths, details, identifiers, and
  secrets

### Requirement: MVP audit summary can require complete MVP evidence

The MVP audit summary helper SHALL support an explicit
`--require-mvp-evidence` option that turns the summary into a fail-closed
post-run gate. Strict mode MUST also require an explicit safe
`--session <session-id>` value and MUST consider only accepted records for that
expected session. It MUST validate one ordered authorization lifecycle instead
of combining unrelated role/action flags.

For the host role, the lifecycle MUST contain authorization approval followed
by active visible authorization for one authorization id; a native screen
capture request followed by matching post-adapter capture completion and frame send; a native input applied
success matching viewer input evidence; permission revocation; and host
disconnect, local session disconnected, or terminal lifecycle evidence. For
the viewer role, it MUST contain a matching screen frame output request
followed by output-written success, matching input sent, and viewer disconnect evidence. Capture and frame records MUST match the
same authorization, frame id, and sequence. Viewer input and host applied
records MUST match the same authorization, event id, and sequence. Required
host applied evidence MUST be preceded by a matching accepted
`input-event.application-requested` record. Required revoke and disconnect
evidence MUST remain bound to the expected session and
authorization. Per-role lifecycle order MUST be determined by record order;
the helper MUST NOT require wall-clock ordering between two PCs.

Pause MUST prevent later native milestones until a matching resume. Revocation,
disconnect, expiration, or termination before a required later native-success
milestone MUST stop that candidate lifecycle; subsequent positive records MUST
NOT revive or complete it.

Denied or failed audit outcomes, records for another session or authorization,
uncorrelated frame/input records, legacy records without required correlation
metadata, and accepted evidence for the wrong role MUST NOT satisfy strict MVP
evidence. If any required role-bound fixed flag or correlation is missing, the
helper MUST exit non-zero with the bounded reason
`missing-required-evidence`. Text and JSON failure output MUST NOT echo raw
audit records, record details, paths, event ids, actor ids, target ids, session
ids, authorization ids, display names, private reasons, pointer coordinates,
key values, frame bytes, screen content, input content, clipboard content,
file-transfer content, diagnostic content, tokens, token environment values,
pairing codes, credentials, command strings, stdout, stderr, or full secrets.

#### Scenario: Strict MVP audit evidence passes

- **WHEN** host and viewer logs contain the complete correlated lifecycle for
  one expected session and authorization, including matching capture/frame and
  input send/applied chains
- **AND** the developer runs
  `npm run mvp:audit-summary -- --host logs\host-audit.jsonl --viewer logs\viewer-audit.jsonl --session demo --require-mvp-evidence`
- **THEN** the helper exits successfully and reports bounded evidence metadata
- **AND** it does not print raw audit records, paths, identifiers, or secrets

#### Scenario: Strict mode requires an expected session

- **WHEN** the developer supplies `--require-mvp-evidence` without a valid
  explicit `--session <session-id>`
- **THEN** the helper rejects the request before reading audit files
- **AND** diagnostics do not expose raw option values, paths, identifiers, or
  secrets

#### Scenario: Missing strict MVP audit evidence fails closed

- **WHEN** either role log lacks any required accepted and correlated evidence
  for the expected session and authorization lifecycle
- **THEN** the helper exits non-zero with `missing-required-evidence`
- **AND** diagnostics remain bounded and do not expose records, paths,
  identifiers, payloads, or secrets

#### Scenario: Mixed sessions fail closed

- **WHEN** required accepted actions exist only after combining records from
  two or more sessions
- **AND** the developer requests strict evidence for one expected session
- **THEN** the helper exits non-zero with `missing-required-evidence`
- **AND** diagnostics remain metadata-only

#### Scenario: Mixed authorizations fail closed

- **WHEN** required accepted actions exist only after combining records from
  different authorization ids in the expected session
- **THEN** the helper exits non-zero with `missing-required-evidence`
- **AND** diagnostics do not expose either authorization id

#### Scenario: Uncorrelated native capture fails closed

- **WHEN** a host frame send lacks an earlier matching accepted native capture
  request and post-adapter completion pair, or the viewer output does not match
  that frame
- **THEN** strict evidence exits non-zero with `missing-required-evidence`
- **AND** no frame identifiers, bytes, screen content, paths, or secrets are
  emitted

#### Scenario: Standalone legacy output-written evidence fails closed

- **WHEN** a viewer output-written record lacks an earlier matching accepted
  output-requested record for the same session, authorization, frame, and sequence
- **THEN** strict evidence exits non-zero with `missing-required-evidence`
- **AND** no frame identifiers, paths, bytes, screen content, or secrets are emitted

#### Scenario: Terminal lifecycle cannot be revived

- **WHEN** an authorization is revoked, disconnected, expired, or terminated
  before a required later native capture or input milestone
- **THEN** later positive records for that authorization do not satisfy strict evidence
- **AND** diagnostics remain bounded and identifier-free

#### Scenario: Unapplied native input fails closed

- **WHEN** viewer input-sent evidence has no matching accepted host
  `input-event.applied` success for the same event and authorization
- **THEN** strict evidence exits non-zero with `missing-required-evidence`
- **AND** no input identifiers, coordinates, keys, contents, or secrets are
  emitted

#### Scenario: Denied or failed audit outcomes do not satisfy strict evidence

- **WHEN** host and viewer audit logs contain only denied or failed records for
  one or more required MVP evidence actions
- **AND** the developer supplies strict mode and an expected session
- **THEN** the helper exits non-zero with `missing-required-evidence`
- **AND** diagnostics remain metadata-only

#### Scenario: Wrong-role audit evidence fails closed

- **WHEN** accepted host-required evidence appears only in the viewer audit log
  or accepted viewer-required evidence appears only in the host audit log
- **THEN** strict evidence exits non-zero with `missing-required-evidence`
- **AND** diagnostics remain metadata-only

#### Scenario: Non-strict audit summary remains available

- **WHEN** host and viewer audit logs are safe and parseable but contain
  partial, mixed-session, or wrong-role MVP evidence
- **AND** the developer omits `--require-mvp-evidence`
- **THEN** the helper still emits bounded summary and coverage flags
- **AND** the output remains metadata-only

### Requirement: MVP evidence fixture helper generates safe local audit evidence

The project SHALL provide a root `npm run mvp:evidence-fixture` helper that
writes deterministic local host and viewer audit JSONL fixture files for dry
running the MVP strict evidence gate. The helper MUST write only to explicit
safe local paths supplied through `--host <path>` and `--viewer <path>`, or to
reviewed default development fixture paths when those options are omitted. It
MUST accept a bounded `--session <session-id>` used internally by every
generated record and use a reviewed non-secret development fixture session
when generation is non-verifying and the option is omitted. It MUST reject
missing option values, duplicate options, blank, untrimmed, oversized,
control-character, Unicode format-control, Windows device, Windows device
namespace, or alternate-data-stream paths before writing files.

Generated records MUST contain only bounded schema-like audit metadata for one
ordered session and authorization lifecycle: host authorization approval,
active visible authorization, native screen capture request, matching
post-adapter capture completion, matching screen frame sent, native input
application request, matching native input applied
success, permission revocation, and host disconnect or terminal lifecycle
evidence; viewer matching screen frame output request and output-written
success, matching input sent, and viewer disconnect evidence. Text and JSON
output MUST remain bounded and MUST NOT echo raw audit records, record details,
event ids, actor ids, target ids, session ids, authorization ids, display
names, private reasons, pointer coordinates, key values, frame bytes, screen
content, input content, clipboard content, file-transfer content, diagnostics,
tokens, token environment values, pairing codes, credentials, command strings,
stdout, stderr, child output, or full secrets.

The helper MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, remote log retrieval, log upload, hidden sessions, AV/EDR
evasion, or Windows prompt bypass.

#### Scenario: Default evidence fixtures are written

- **WHEN** a developer runs `npm run mvp:evidence-fixture`
- **THEN** the helper writes one correlated bounded host/viewer lifecycle to
  the reviewed default local fixture paths
- **AND** output reports only fixed fixture status metadata
- **AND** the helper does not start remote-assistance runtime processes or
  expose raw audit content

#### Scenario: Explicit evidence fixture paths are accepted

- **WHEN** a developer runs
  `npm run mvp:evidence-fixture -- --host logs\fixture-host.jsonl --viewer logs\fixture-viewer.jsonl --session fixture-session`
- **THEN** the helper writes only those two safe local fixture files with the
  expected session bound internally
- **AND** output does not echo raw records, identifiers, local absolute paths,
  tokens, pairing codes, stdout, stderr, or secrets

#### Scenario: Unsafe evidence fixture paths fail closed

- **WHEN** a developer omits an option value, repeats a path/session option, or
  supplies an unsafe fixture path or session id
- **THEN** the helper exits non-zero before writing fixture files
- **AND** diagnostics do not echo unsafe values, raw records, local paths,
  stdout, stderr, child output, credentials, or secrets

### Requirement: MVP evidence fixture helper verifies strict evidence gate

The MVP evidence fixture helper SHALL support an explicit `--verify` option
that runs the existing strict audit-summary evidence check against generated
fixture files after writing them. Verification MUST require an explicit safe
`--session <session-id>` and use the equivalent of
`mvp:audit-summary -- --host <host-fixture> --viewer <viewer-fixture> --session <session-id> --require-mvp-evidence`
without spawning a child process or surfacing raw audit-summary output. When
verification succeeds, the helper MUST report bounded fixture and verification
status metadata only. When verification fails, the helper MUST exit non-zero
with bounded fixed reason metadata and MUST NOT expose raw audit records,
record details, identifiers, paths, stdout, stderr, child output, frame bytes,
screen content, input content, clipboard content, credentials, tokens, pairing
codes, or full secrets.

#### Scenario: Generated fixtures pass strict verification

- **WHEN** a developer runs
  `npm run mvp:evidence-fixture -- --verify --session fixture-session`
- **THEN** the helper writes the generated fixture files
- **AND** it verifies the same expected session through the strict MVP evidence
  gate
- **AND** output reports only bounded fixture and verification metadata

#### Scenario: Verification without a session fails closed

- **WHEN** the helper receives `--verify` without an explicit safe `--session`
- **THEN** it rejects the request before writing or reading fixture files
- **AND** diagnostics remain bounded and identifier-free

#### Scenario: Verification remains local and non-runtime

- **WHEN** the helper runs with `--verify` and an expected session
- **THEN** verification reads only the generated local fixture files
- **AND** it does not start relay, host, viewer, browser, capture, input,
  sockets, HTTP listeners, services, startup persistence, unattended access,
  privilege elevation, remote log retrieval, log upload, hidden sessions,
  AV/EDR evasion, or Windows prompt bypass

### Requirement: MVP trial helper verifies explicit post-run audit evidence

The root `npm run mvp:trial` helper SHALL support an explicit evidence mode
that validates a completed two-PC development MVP trial by delegating to the
existing strict audit-summary gate. Evidence mode MUST require explicit local
`--host-audit <path>`, `--viewer-audit <path>`, and safe
`--session <session-id>` arguments, MUST invoke the equivalent of
`mvp:audit-summary -- --host <path> --viewer <path> --session <session-id> --require-mvp-evidence`,
and MUST fail closed when the strict summary fails. It MUST reject missing,
duplicate, malformed, blank, untrimmed, oversized, control-character, Unicode
format-control, Windows device, Windows device namespace, or alternate-data
stream path/session arguments before delegation. Text and JSON diagnostics
MUST remain bounded and MUST NOT echo raw paths, raw audit records, record
details, event ids, actor ids, target ids, session ids, authorization ids,
display names, private reasons, pointer coordinates, key values, frame bytes,
screen content, input content, clipboard content, file-transfer content,
diagnostic content, tokens, token environment values, pairing codes,
credentials, generated commands, stdout, stderr, or full secrets. Evidence
mode MUST NOT start relay, host, viewer, browser, capture, input, services,
startup persistence, unattended access, network listeners, privilege
elevation, remote log retrieval, log upload, hidden sessions, AV/EDR evasion,
or Windows prompt bypass.

#### Scenario: Trial evidence passes with strict audit evidence

- **WHEN** a developer runs
  `npm run mvp:trial -- --evidence --host-audit logs\host-audit.jsonl --viewer-audit logs\viewer-audit.jsonl --session demo`
- **AND** the strict audit-summary gate finds the complete correlated lifecycle
  for that expected session
- **THEN** the helper exits successfully and reports bounded evidence status
- **AND** it does not print raw audit records, paths, identifiers, or secrets

#### Scenario: Trial evidence requires an expected session

- **WHEN** a developer requests evidence mode without a valid explicit
  `--session <session-id>`
- **THEN** the helper rejects the request before invoking audit-summary
- **AND** diagnostics do not echo raw paths, option values, or identifiers

#### Scenario: Trial evidence fails when strict evidence is missing

- **WHEN** the explicit host or viewer audit log lacks required correlated MVP
  evidence for the expected session
- **THEN** the helper exits non-zero with bounded fixed diagnostics
- **AND** diagnostics do not expose raw logs, paths, identifiers, frame bytes,
  input contents, command strings, stdout, stderr, or secrets

#### Scenario: Trial evidence rejects unsafe audit paths

- **WHEN** a developer omits a required audit path, repeats an audit/session
  option, or supplies an unsafe audit path or session id
- **THEN** the helper rejects the request before invoking audit-summary
- **AND** diagnostics do not echo the raw argument value
