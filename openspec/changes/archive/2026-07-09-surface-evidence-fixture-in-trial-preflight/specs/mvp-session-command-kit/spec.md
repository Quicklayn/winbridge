## ADDED Requirements

### Requirement: MVP preflight surfaces evidence fixture readiness

The reviewed MVP command and trial planning surfaces SHALL include a fixed
preflight reference to `npm run mvp:ready -- --include-evidence-fixture` so
operators can dry-run the strict evidence gate before a live two-PC trial. The
reference MUST be present in text output and bounded JSON metadata for the
full `mvp:commands` preflight plan, the preflight-only command plan, and the
full `mvp:trial` plan. The reference MUST remain non-executing in those
planning surfaces and MUST be labeled as a generated local fixture dry run, not
as proof of a live two-PC session.

The planning surfaces MUST NOT echo generated fixture paths, raw fixture JSONL,
raw audit records, local paths, relay URLs, local URLs, token values, pairing
codes, stdout, stderr, child output, frame bytes, screen contents, input
contents, clipboard contents, credentials, full secrets, or generated runtime
commands. This requirement MUST NOT start relay, host, viewer, browser,
capture, input, sockets, HTTP listeners, services, startup persistence,
unattended access, privilege elevation, remote log retrieval, log upload,
hidden sessions, AV/EDR evasion, or Windows prompt bypass.

#### Scenario: Command kit prints evidence fixture preflight

- **WHEN** a developer renders the default MVP command plan or preflight-only
  command plan
- **THEN** the output includes the fixed evidence fixture readiness command
- **AND** the surrounding text labels it as a local dry-run gate before the
  live two-PC trial
- **AND** output remains bounded and does not expose unsafe values

#### Scenario: Trial plan prints evidence fixture preflight

- **WHEN** a developer renders the full two-PC MVP trial plan
- **THEN** the plan includes the fixed evidence fixture readiness command as a
  preflight step before post-run evidence
- **AND** it still states that live trial proof requires strict role-bound
  post-run evidence

#### Scenario: Role and evidence-only plans stay scoped

- **WHEN** a developer renders role-scoped `mvp:trial -- --role relay`,
  `--role host`, `--role viewer`, or `--role evidence` output
- **THEN** each scoped plan keeps only the relevant role/evidence steps
- **AND** diagnostics and JSON metadata remain bounded and secret-safe
