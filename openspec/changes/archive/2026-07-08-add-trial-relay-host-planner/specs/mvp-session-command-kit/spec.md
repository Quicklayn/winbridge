## ADDED Requirements

### Requirement: MVP trial helper accepts bounded relay host planning

The root `npm run mvp:trial` helper SHALL support an optional plan-mode
`--relay-host <host>` argument that validates the relay host shortcut using the
same bounded LAN-host rules as the MVP command kit and substitutes that value
only into the fixed `mvp:commands -- --only ... --relay-host <host>
--token-env WINBRIDGE_RELAY_SHARED_TOKEN` command-reference strings. When
omitted, the helper MUST preserve the existing `<relay-pc-lan-ip>` placeholder
output. The argument MUST be rejected when duplicated, blank, malformed,
loopback, unspecified, secret-bearing, or supplied in evidence mode. The helper
MUST remain non-executing and MUST NOT start relay, host, viewer, browser,
capture, input, sockets, HTTP listeners, services, startup persistence,
unattended access, privilege elevation, LAN discovery, firewall changes,
AV/EDR evasion, Windows prompt bypass, or hidden-session behavior. Trial output
MUST NOT echo generated runtime commands, relay URLs, pairing codes, token
values, local control URLs, audit records, frame bytes, screen contents, input
contents, clipboard contents, credentials, diagnostics dumps, stdout, stderr,
child output, or full secrets.

#### Scenario: Trial plan references a concrete relay host

- **WHEN** a developer runs
  `npm run mvp:trial -- --relay-host 192.168.1.10`
- **THEN** the helper prints bounded relay, host, and viewer
  command-reference steps that include `--relay-host 192.168.1.10`
- **AND** it still does not print generated relay, host, viewer, or browser
  runtime commands
- **AND** it does not print a relay URL, pairing code, token value, local URL,
  audit path contents, frame bytes, screen contents, input contents, or secret

#### Scenario: Role-filtered trial plan references the relay host

- **WHEN** a developer runs
  `npm run mvp:trial -- --role viewer --relay-host support-relay.lan --json`
- **THEN** the helper emits bounded JSON with only the viewer workflow section
  and fixed command-reference steps using `--relay-host support-relay.lan`
- **AND** the JSON remains non-executing bounded metadata only

#### Scenario: Unsafe trial relay host fails closed

- **WHEN** a developer supplies a duplicate, blank, malformed, loopback,
  unspecified, secret-bearing, or evidence-mode `--relay-host` value
- **THEN** `mvp:trial` exits non-zero with bounded usage metadata
- **AND** diagnostics do not echo the unsafe relay host, generated commands,
  relay URLs, local URLs, pairing codes, token values, stdout, stderr, child
  output, credentials, or secrets
