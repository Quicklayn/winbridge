## MODIFIED Requirements

### Requirement: MVP trial helper prints a two-PC operator workflow

The project SHALL provide a root `npm run mvp:trial` helper that prints a
bounded, non-executing two-PC development MVP operator workflow. The helper
MUST include fixed preflight, relay, host, viewer, browser, and post-run
evidence sections that reference the existing role-scoped `mvp:ready` gates,
the existing role-filtered `mvp:commands` outputs, reviewed relay/host/viewer
`mvp:run` command-reference templates, reviewed host/viewer `mvp:lan-probe`
command-reference steps, and the strict
`mvp:audit-summary -- --require-mvp-evidence` post-run gate. The full preflight
section MUST include, in order, the fixed session-bootstrap command reference,
`npm run mvp:ready -- --include-all-smoke`,
`npm run mvp:ready -- --include-windows-control-smoke`,
`npm run mvp:ready -- --include-evidence-fixture`, and the fixed operator
reminder. The native Windows control smoke reference MUST remain a separate
manual opt-in and the trial helper MUST NOT execute it. Relay, host, and viewer
runner references MUST use placeholders for session and pairing metadata, MUST
use `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`, MUST include the explicit
`--i-understand-foreground` acknowledgement, and MUST use the bounded
relay-host shortcut rather than printing generated relay URLs. Host and viewer
probe references MUST use placeholders for session and pairing metadata and
MUST use the bounded relay-host shortcut rather than printing generated relay
URLs. The browser section MUST reference the existing
`mvp:commands -- --only browser` command plan and MUST instruct the viewer
operator to open the loopback viewer surface only after the viewer runtime
reports readiness. The helper MUST support text output by default and bounded
JSON output with `--json`. It MUST support `--role relay`, `--role host`,
`--role viewer`, `--role browser`, and `--role evidence` filters without
changing the default full workflow. Plan output MUST remain bounded and MUST
NOT echo raw relay URLs, pairing codes, token values, token environment values,
generated command strings, local URLs, local paths, stdout, stderr, audit
records, frame bytes, screen contents, input contents, clipboard contents,
credentials, diagnostics dumps, or full secrets. The helper MUST NOT start
relay, host, viewer, browser, capture, input, sockets, HTTP listeners,
services, startup persistence, unattended access, privilege elevation, remote
discovery, firewall changes, AV/EDR evasion, Windows prompt bypass, or
hidden-session behavior.

#### Scenario: Default trial plan prints every role

- **WHEN** a developer runs `npm run mvp:trial`
- **THEN** the helper prints bounded preflight, relay, host, viewer, browser,
  and evidence workflow sections
- **AND** the preflight section shows the ordered session bootstrap, local
  all-smoke, separate native Windows control smoke, evidence fixture, and
  operator reminder steps
- **AND** the output references the existing readiness, command-plan,
  reviewed role-runner template, LAN probe, browser command-reference, and
  strict audit-summary gates without executing them

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
- **AND** it does not print preflight, relay, viewer, browser, or evidence
  runtime command blocks

#### Scenario: Trial plan filters browser role

- **WHEN** a developer runs `npm run mvp:trial -- --role browser`
- **THEN** the helper prints only the bounded browser workflow section
- **AND** the section references viewer readiness and the existing
  `mvp:commands -- --only browser` command plan
- **AND** it does not print preflight, relay, host, viewer, evidence, capture,
  input, or runtime command blocks

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

#### Scenario: Native trial preflight remains explicit and non-executing

- **WHEN** a developer renders the full trial plan in text or JSON mode
- **THEN** the plan references the native Windows control smoke as a separate
  manual command after local all-smoke
- **AND** rendering the plan does not capture the screen, apply input, start a
  browser, relay, host, viewer, socket, listener, service, or background process

### Requirement: MVP ready validates trial helper plan output

The root MVP ready helper SHALL validate the two-PC trial helper plan output as
part of default aggregate readiness and role-scoped readiness. Default
readiness MUST run the non-executing `mvp:trial -- --json` plan and accept it
only when the bounded JSON reports `ok=true`, `mode=plan`,
`nonExecuting=true`, fixed preflight, relay, host, viewer, browser, and evidence
role records, the exact ordered preflight step names and command references,
reviewed relay/host/viewer `mvp:run` command-reference templates with
placeholder session and pairing values, `--token-env
WINBRIDGE_RELAY_SHARED_TOKEN`, `--i-understand-foreground`, reviewed
host/viewer LAN probe command-reference steps, reviewed browser
command-reference steps, and the reviewed safety reminders. The preflight
record MUST contain the session bootstrap, local all-smoke, separate native
Windows control smoke, evidence fixture, and operator reminder steps in that
order. Relay, host, and viewer role-scoped readiness MUST run the matching
non-executing `mvp:trial -- --role <role> --json` plan and accept it only when
exactly that role record is present. Viewer role-scoped readiness MUST also run
the non-executing `mvp:trial -- --role browser --json` plan and accept it only
when the reviewed browser record is present, because the browser surface is
opened on the viewer PC. Readiness MUST fail closed on missing, reordered,
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
- **AND** it accepts only the fixed preflight, relay, host, viewer, browser,
  and evidence workflow records with the exact ordered preflight gates,
  reviewed role-runner templates, reviewed LAN probe references, reviewed
  browser command-reference, and reviewed safety reminders
- **AND** readiness output reports only bounded fixed status metadata

#### Scenario: Role ready validates matching trial plan

- **WHEN** a developer runs `npm run mvp:ready -- --role host`
- **THEN** the helper validates bounded
  `mvp:trial -- --role host --json` output
- **AND** it accepts the host record only when the reviewed host role-runner
  template and host LAN probe reference are present
- **AND** it fails closed if preflight, relay, viewer, browser, evidence, or
  malformed role metadata is present

#### Scenario: Viewer ready validates browser trial plan

- **WHEN** a developer runs `npm run mvp:ready -- --role viewer`
- **THEN** the helper validates bounded
  `mvp:trial -- --role viewer --json` output
- **AND** it validates bounded `mvp:trial -- --role browser --json` output
- **AND** the browser trial plan is accepted only when the reviewed browser
  command-reference and viewer readiness reminder are present

#### Scenario: Trial readiness drift fails closed

- **WHEN** trial helper JSON omits required safety reminders, changes mode,
  reports evidence mode, includes duplicate roles, omits the requested role,
  omits, reorders, duplicates, or changes a required preflight gate, omits a
  required role-runner template, omits the browser section from the full plan,
  replaces `--token-env` with raw `--token`, prints a raw relay URL, prints a
  concrete pairing code, or omits `--i-understand-foreground`
- **THEN** `mvp:ready` treats the matching trial-plan check as failed
- **AND** diagnostics do not echo command strings, URLs, paths, audit records,
  stdout, stderr, child output, credentials, frame bytes, input contents, or
  secrets

#### Scenario: Trial readiness validation remains non-executing

- **WHEN** default readiness validates the full trial plan
- **THEN** it parses only the bounded plan JSON and does not execute any
  referenced smoke, capture, input, relay, role, browser, or evidence command
