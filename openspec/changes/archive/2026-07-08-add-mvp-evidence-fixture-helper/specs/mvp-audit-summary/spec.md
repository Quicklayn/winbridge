## ADDED Requirements

### Requirement: MVP evidence fixture helper generates safe local audit evidence

The project SHALL provide a root `npm run mvp:evidence-fixture` helper that
writes deterministic local host and viewer audit JSONL fixture files for dry
running the MVP strict evidence gate. The helper MUST write only to explicit
safe local paths supplied through `--host <path>` and `--viewer <path>`, or to
reviewed default development fixture paths when those options are omitted. It
MUST reject missing option values, duplicate options, blank, untrimmed,
oversized, control-character, Unicode format-control, Windows device, Windows
device namespace, or alternate-data-stream paths before writing files. The
generated records MUST contain only bounded schema-like audit metadata using
the same fixed action/outcome shapes required by strict MVP evidence:
host authorization approval, host active visible authorization, host screen
frame sent, host permission revocation, host disconnect or terminal lifecycle
evidence, viewer screen frame output, viewer input sent, and viewer disconnect
evidence. Text and JSON output MUST remain bounded and MUST NOT echo raw audit
records, record details, event ids, actor ids, target ids, session ids,
authorization ids, display names, private reasons, pointer coordinates, key
values, frame bytes, screen content, input content, clipboard content,
file-transfer content, diagnostics, tokens, token environment values, pairing
codes, credentials, command strings, stdout, stderr, child output, or full
secrets.

The helper MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, remote log retrieval, log upload, hidden sessions, AV/EDR
evasion, or Windows prompt bypass.

#### Scenario: Default evidence fixtures are written

- **WHEN** a developer runs `npm run mvp:evidence-fixture`
- **THEN** the helper writes bounded host and viewer audit fixture files to the
  reviewed default local fixture paths
- **AND** output reports only fixed fixture status metadata
- **AND** the helper does not start remote-assistance runtime processes or
  expose raw audit content

#### Scenario: Explicit evidence fixture paths are accepted

- **WHEN** a developer runs
  `npm run mvp:evidence-fixture -- --host logs\fixture-host.jsonl --viewer logs\fixture-viewer.jsonl`
- **THEN** the helper writes only those two safe local fixture files
- **AND** output does not echo raw file contents, identifiers, local absolute
  paths, tokens, pairing codes, stdout, stderr, or secrets

#### Scenario: Unsafe evidence fixture paths fail closed

- **WHEN** a developer omits an option value, repeats a path option, or supplies
  an unsafe fixture path
- **THEN** the helper exits non-zero before writing fixture files
- **AND** diagnostics do not echo the unsafe path value, raw records, local
  paths, stdout, stderr, child output, credentials, or secrets

### Requirement: MVP evidence fixture helper verifies strict evidence gate

The MVP evidence fixture helper SHALL support an explicit `--verify` option
that runs the existing strict audit-summary evidence check against the generated
fixture files after writing them. Verification MUST use the equivalent of
`mvp:audit-summary -- --host <host-fixture> --viewer <viewer-fixture> --require-mvp-evidence`
without spawning a child process or surfacing raw audit-summary output. When
verification succeeds, the helper MUST report bounded fixture and verification
status metadata only. When verification fails, the helper MUST exit non-zero
with bounded fixed reason metadata and MUST NOT expose raw audit records,
record details, identifiers, paths, stdout, stderr, child output, frame bytes,
screen content, input content, clipboard content, credentials, tokens, pairing
codes, or full secrets.

#### Scenario: Generated fixtures pass strict verification

- **WHEN** a developer runs `npm run mvp:evidence-fixture -- --verify`
- **THEN** the helper writes the generated fixture files
- **AND** the helper verifies them through the strict MVP evidence gate
- **AND** output reports only bounded fixture and verification metadata

#### Scenario: Verification remains local and non-runtime

- **WHEN** the helper runs with `--verify`
- **THEN** verification reads only the generated local fixture files
- **AND** it does not start relay, host, viewer, browser, capture, input,
  sockets, HTTP listeners, services, startup persistence, unattended access,
  privilege elevation, remote log retrieval, log upload, hidden sessions,
  AV/EDR evasion, or Windows prompt bypass
