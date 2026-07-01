## ADDED Requirements

### Requirement: MVP ready validates native control role-filter markers

The default aggregate MVP ready helper SHALL validate that accepted
host/viewer role-filtered command output preserves the reviewed native Windows
control command path. Host role-filter output MUST include the reviewed
`--host-apply-input true` marker and `--dev-screen-frame-source windows-capture`
marker. Viewer role-filter output MUST include the reviewed
`screen:view,input:pointer,input:keyboard` request marker and the reviewed
latest-frame output path marker. The validation MUST apply to default,
token-env, and representative LAN host/viewer role-filter checks, MUST remain
non-executing, and MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows
prompt bypass, or hidden-session behavior. Failure output MUST remain bounded
and MUST NOT echo generated command strings, relay URLs, local URLs, ports,
token references, token values, token environment values, pairing codes, local
paths, stdout, stderr, child output, credentials, frame bytes, screen contents,
input contents, clipboard contents, or full secrets.

#### Scenario: Default ready accepts reviewed role-filter native control path

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the host role-filter checks accept output only when it preserves the
  reviewed host input and Windows capture markers
- **AND** the viewer role-filter checks accept output only when it preserves
  the reviewed screen/input request and latest-frame output markers
- **AND** output reports only bounded fixed status metadata for those checks

#### Scenario: Role-filter native control drift fails closed

- **WHEN** a host or viewer role-filter output omits or changes the reviewed
  host input marker, host Windows capture marker, viewer screen/input request
  marker, or viewer latest-frame output marker
- **THEN** `mvp:ready` treats the matching role-filter check as failed
- **AND** diagnostics do not echo the unsafe command string, relay URL, local
  URL, token reference, token value, pairing code, path, stdout, stderr, child
  output, credential, screen content, input content, or full secret

#### Scenario: Role-filter validation stays non-executing

- **WHEN** `mvp:ready` validates default, LAN, or token-env host/viewer
  role-filter output
- **THEN** it only parses the command kit text output
- **AND** it does not execute the generated relay, host, viewer, browser,
  capture, or input commands
