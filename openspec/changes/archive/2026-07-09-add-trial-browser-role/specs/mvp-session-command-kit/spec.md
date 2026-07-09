## MODIFIED Requirements

### Requirement: MVP trial helper prints a two-PC operator workflow

The project SHALL provide a root `npm run mvp:trial` helper that prints a
bounded, non-executing two-PC development MVP operator workflow. The helper
MUST include fixed relay, host, viewer, browser, and post-run evidence sections
that reference the existing role-scoped `mvp:ready` gates, the existing
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
generated relay URLs. The browser section MUST reference the existing
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
- **THEN** the helper prints bounded relay, host, viewer, browser, and
  evidence workflow sections
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
- **AND** it does not print relay, viewer, browser, or evidence runtime command
  blocks

#### Scenario: Trial plan filters browser role

- **WHEN** a developer runs `npm run mvp:trial -- --role browser`
- **THEN** the helper prints only the bounded browser workflow section
- **AND** the section references viewer readiness and the existing
  `mvp:commands -- --only browser` command plan
- **AND** it does not print relay, host, viewer, evidence, capture, input, or
  runtime command blocks

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
