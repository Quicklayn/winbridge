## ADDED Requirements

### Requirement: MVP command kit renders host consent timeout

The MVP command kit SHALL support a bounded
`--host-consent-timeout-ms <milliseconds>` option for generated host commands
that use interactive host consent. When omitted, the command kit MUST render
the existing default timeout of `60000` ms explicitly. The timeout value MUST
be an integer from `1` through `2147483647`, MUST be rejected when malformed,
duplicate, blank, fractional, negative, zero, oversized, or unsafe, and MUST be
rejected before rendering relay, host, viewer, browser, preflight, JSON, or
role-filter commands. The helper MUST remain non-executing and MUST NOT start
relay, host, viewer, browser, capture, input, services, startup persistence,
unattended access, privilege elevation, Windows prompt bypass, hidden sessions,
or hidden capture. Diagnostics MUST remain bounded and MUST NOT echo raw unsafe
timeout input, generated command strings, relay URLs, local URLs, token values,
token environment values, pairing codes, local paths, stdout, stderr, child
output, frame bytes, input contents, clipboard contents, credentials, or full
secrets.

#### Scenario: Default host consent timeout is explicit

- **WHEN** a developer renders the default MVP session command plan
- **THEN** every generated host command that includes
  `--host-consent-prompt 'true'` also includes
  `--host-consent-timeout-ms '60000'`
- **AND** the command kit does not execute any generated command

#### Scenario: Custom host consent timeout is rendered

- **WHEN** a developer renders the MVP session command plan with
  `--host-consent-timeout-ms 30000`
- **THEN** generated host commands include
  `--host-consent-timeout-ms '30000'`
- **AND** the timeout does not grant permissions or bypass host consent

#### Scenario: Unsafe host consent timeout fails closed

- **WHEN** a developer supplies a blank, duplicate, fractional, negative, zero,
  oversized, non-numeric, or unsafe `--host-consent-timeout-ms` value
- **THEN** the command kit rejects the input before rendering commands
- **AND** diagnostics report only bounded usage metadata without echoing the
  raw unsafe value

### Requirement: MVP ready validates host consent timeout rendering

The root MVP ready helper SHALL validate that the reviewed non-executing
command plans render the host consent timeout argument for host commands that
use interactive consent. It MUST fail closed if localhost, LAN, token-env,
role-filter, or ephemeral browser command-plan validation observes a missing,
malformed, duplicated, or unexpected host consent timeout argument. Failure
output MUST remain bounded and MUST NOT echo generated command strings, relay
URLs, local URLs, token values, token environment values, pairing codes, local
paths, stdout, stderr, child output, frame bytes, input contents, clipboard
contents, credentials, diagnostics, or full secrets.

#### Scenario: Default readiness validates host timeout

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates that generated host command-plan output
  includes the reviewed `--host-consent-timeout-ms '60000'` argument
- **AND** readiness reports only bounded fixed status metadata

#### Scenario: Host timeout drift fails readiness

- **WHEN** command-plan output omits, duplicates, malforms, or changes the
  reviewed host consent timeout argument unexpectedly
- **THEN** the ready helper fails closed with bounded failure metadata
- **AND** diagnostics do not echo generated command text or unsafe values
