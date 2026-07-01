## ADDED Requirements

### Requirement: MVP command kit includes host local control surface

The MVP command kit SHALL render generated host commands with an explicit
`--host-control-surface-port` option for the existing host-only loopback local
control surface. The default generated value MUST be `0`, causing the runtime
host process to bind only to `127.0.0.1` with an OS-assigned ephemeral port and
log the bounded local URL for the host operator. Custom host surface ports MUST
be accepted only when they are `0` or an integer from `1024` through `65535`.
Malformed, duplicate, blank, fractional, negative, privileged, oversized, or
unsafe host surface port inputs MUST be rejected before rendering relay, host,
viewer, browser, token, JSON, role-filter, or preflight commands. The helper
MUST remain non-executing and MUST NOT start listeners, launch host browsers,
approve sessions, grant permissions, capture the screen, apply input, install
services, configure startup persistence, elevate privileges, run unattended,
collect credentials, keylog, evade AV/EDR, bypass Windows prompts, or hide the
host active-session indicator.

#### Scenario: Default host command uses ephemeral host surface

- **WHEN** a developer renders the default MVP session command plan
- **THEN** the generated host command includes
  `--host-control-surface-port '0'`
- **AND** the text plan instructs the host operator to open the host local
  control surface URL printed by the host command log
- **AND** the helper does not fabricate `http://127.0.0.1:0/` or start a host
  browser

#### Scenario: Custom host surface port is rendered

- **WHEN** a developer renders the MVP session command plan with
  `--host-control-surface-port 35986`
- **THEN** the generated host command includes
  `--host-control-surface-port '35986'`
- **AND** the helper still prints commands only and does not start the host
  surface, host browser, relay, viewer, capture, or input

#### Scenario: Unsafe host surface port fails closed

- **WHEN** a developer supplies a blank, duplicate, fractional, negative,
  privileged, oversized, non-numeric, or unsafe
  `--host-control-surface-port` value
- **THEN** the command kit rejects the input before rendering commands
- **AND** diagnostics remain bounded and do not echo raw unsafe input,
  generated command strings, relay URLs, local URLs, token values, pairing
  codes, local paths, stdout, stderr, child output, frame bytes, input
  contents, credentials, or full secrets

### Requirement: MVP ready validates host local control surface rendering

The root MVP ready helper SHALL validate that reviewed non-executing command
plans render the host local control surface option for host commands. It MUST
fail closed if localhost, LAN, token-env, role-filter, or ephemeral
command-plan validation observes a missing, malformed, duplicated, or
unexpected host local control surface argument. Failure output MUST remain
bounded and MUST NOT echo generated command strings, relay URLs, local URLs,
token values, token environment values, pairing codes, local paths, stdout,
stderr, child output, frame bytes, input contents, clipboard contents,
credentials, diagnostics, or full secrets.

#### Scenario: Default readiness validates host local surface

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates that generated host command-plan output
  includes the reviewed `--host-control-surface-port '0'` argument
- **AND** readiness reports only bounded fixed status metadata

#### Scenario: Host surface drift fails readiness

- **WHEN** command-plan output omits, duplicates, malforms, or changes the
  reviewed host local surface argument unexpectedly
- **THEN** `mvp:ready` fails the command-plan readiness check
- **AND** diagnostics do not echo generated command text, local URLs, tokens,
  pairing codes, stdout, stderr, child output, frame bytes, input contents,
  clipboard contents, credentials, diagnostics, or full secrets
