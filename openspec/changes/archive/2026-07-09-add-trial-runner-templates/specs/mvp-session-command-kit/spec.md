## MODIFIED Requirements

### Requirement: MVP trial helper prints a two-PC operator workflow

The project SHALL provide a root `npm run mvp:trial` helper that prints a
bounded, non-executing two-PC development MVP operator workflow. The helper
MUST include fixed relay, host, viewer, and post-run evidence sections that
reference the existing role-scoped `mvp:ready` gates, the existing
role-filtered `mvp:commands` outputs, reviewed relay/host/viewer `mvp:run`
command-reference templates, reviewed host/viewer `mvp:lan-probe`
command-reference steps, and the strict
`mvp:audit-summary -- --require-mvp-evidence` post-run gate. Relay, host, and
viewer runner references MUST use placeholders for session and pairing
metadata, MUST use `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`, MUST include
the explicit `--i-understand-foreground` acknowledgement, and MUST use the
bounded relay-host shortcut rather than printing generated relay URLs. Host
and viewer probe references MUST use placeholders for session and pairing
metadata and MUST use the bounded relay-host shortcut rather than printing
generated relay URLs. The helper MUST support text output by default and
bounded JSON output with `--json`. It MUST support `--role relay`, `--role
host`, `--role viewer`, and `--role evidence` filters without changing the
default full workflow. Plan output MUST remain bounded and MUST NOT echo raw
relay URLs, pairing codes, token values, token environment values, generated
command strings, local URLs, local paths, stdout, stderr, audit records, frame
bytes, screen contents, input contents, clipboard contents, credentials,
diagnostics dumps, or full secrets. The helper MUST NOT start relay, host,
viewer, browser, capture, input, sockets, HTTP listeners, services, startup
persistence, unattended access, privilege elevation, remote discovery,
firewall changes, AV/EDR evasion, Windows prompt bypass, or hidden-session
behavior.

#### Scenario: Default trial plan prints every role

- **WHEN** a developer runs `npm run mvp:trial`
- **THEN** the helper prints bounded relay, host, viewer, and evidence
  workflow sections
- **AND** the output references the existing readiness, command-plan,
  reviewed role-runner template, LAN probe, and strict audit-summary gates
  without executing them

#### Scenario: Trial plan JSON remains bounded

- **WHEN** a developer runs `npm run mvp:trial -- --json`
- **THEN** the helper emits machine-readable metadata containing only `ok`,
  fixed workflow role records, fixed safety reminders, and fixed command
  references
- **AND** the JSON omits generated command strings, relay URLs, pairing codes,
  tokens, token environment values, local URLs, local paths, audit records,
  frame bytes, screen contents, input contents, credentials, stdout, stderr,
  diagnostics, and full secrets

#### Scenario: Trial plan filters one role

- **WHEN** a developer runs `npm run mvp:trial -- --role host`
- **THEN** the helper prints only the bounded host workflow section
- **AND** it does not print relay, viewer, browser, or evidence runtime command
  blocks

#### Scenario: Trial plan includes role-runner templates

- **WHEN** a developer runs `npm run mvp:trial -- --relay-host 192.168.1.10`
- **THEN** the relay, host, and viewer workflow sections include bounded
  `mvp:run` command-reference templates using `--relay-host 192.168.1.10`,
  `--session <session-id>`, `--pairing <pairing-code>`,
  `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`, and
  `--i-understand-foreground`
- **AND** those templates do not include raw relay URLs, concrete pairing
  codes, token values, stdout, stderr, child output, screen contents, input
  contents, or secrets
- **AND** the helper does not execute the runner templates

#### Scenario: Trial plan includes host and viewer probe references

- **WHEN** a developer runs `npm run mvp:trial -- --relay-host 192.168.1.10`
- **THEN** the host and viewer workflow sections include bounded
  `mvp:lan-probe` command-reference steps using `--relay-host 192.168.1.10`
- **AND** those references retain placeholders for session and pairing metadata
- **AND** the output does not include generated relay URLs, concrete pairing
  codes, token values, stdout, stderr, child output, screen contents, input
  contents, or secrets

#### Scenario: Trial plan rejects malformed options

- **WHEN** a developer supplies duplicate, unknown, blank, unsafe, or
  unsupported trial-plan options
- **THEN** the helper exits non-zero with bounded fixed diagnostics before
  printing workflow sections
- **AND** it does not echo unsafe option values or execute runtime commands

### Requirement: MVP ready validates trial helper plan output

The root MVP ready helper SHALL validate the two-PC trial helper plan output as
part of default aggregate readiness and role-scoped readiness. Default
readiness MUST run the non-executing `mvp:trial -- --json` plan and accept it
only when the bounded JSON reports `ok=true`, `mode=plan`,
`nonExecuting=true`, fixed relay, host, viewer, and evidence role records,
reviewed relay/host/viewer `mvp:run` command-reference templates with
placeholder session and pairing values, `--token-env
WINBRIDGE_RELAY_SHARED_TOKEN`, `--i-understand-foreground`, reviewed
host/viewer LAN probe command-reference steps, and the reviewed safety
reminders. Relay, host, and viewer role-scoped readiness MUST run the matching
non-executing `mvp:trial -- --role <role> --json` plan and accept it only when
exactly that role record is present. Readiness MUST fail closed on missing,
duplicated, malformed, renamed, extra, evidence-mode, cross-role, raw-token,
raw-relay-URL, concrete-pairing, or missing-foreground-ack trial metadata.
Failure output MUST remain bounded and MUST NOT echo generated commands, relay
URLs, local URLs, token values, token environment values, pairing codes, local
paths, audit paths, audit records, frame bytes, screen contents, input
contents, stdout, stderr, child output, credentials, diagnostics, or full
secrets. The validation MUST remain non-executing and MUST NOT start relay,
host, viewer, browser, capture, input, sockets, HTTP listeners, services,
startup persistence, unattended access, privilege elevation, LAN discovery,
firewall changes, AV/EDR evasion, Windows prompt bypass, or hidden-session
behavior.

#### Scenario: Default ready validates full trial plan

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates bounded `mvp:trial -- --json` output
- **AND** it accepts only the fixed relay, host, viewer, and evidence workflow
  records with reviewed role-runner templates, reviewed LAN probe references,
  and reviewed safety reminders
- **AND** readiness output reports only bounded fixed status metadata

#### Scenario: Role ready validates matching trial plan

- **WHEN** a developer runs `npm run mvp:ready -- --role host`
- **THEN** the helper validates bounded
  `mvp:trial -- --role host --json` output
- **AND** it accepts the host record only when the reviewed host role-runner
  template and host LAN probe reference are present
- **AND** it fails closed if relay, viewer, evidence, or malformed role
  metadata is present

#### Scenario: Trial readiness drift fails closed

- **WHEN** trial helper JSON omits required safety reminders, changes mode,
  reports evidence mode, includes duplicate roles, omits the requested role,
  omits a required role-runner template, replaces `--token-env` with raw
  `--token`, prints a raw relay URL, prints a concrete pairing code, or omits
  `--i-understand-foreground`
- **THEN** `mvp:ready` treats the matching trial-plan check as failed
- **AND** diagnostics do not echo command strings, URLs, paths, audit records,
  stdout, stderr, child output, credentials, frame bytes, input contents, or
  secrets
