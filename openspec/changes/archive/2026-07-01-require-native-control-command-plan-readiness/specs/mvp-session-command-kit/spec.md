## ADDED Requirements

### Requirement: MVP ready validates native control command-plan markers

The default aggregate MVP ready helper SHALL validate that every full session
JSON command-plan it accepts preserves the reviewed native Windows control
command path. For default localhost, representative LAN, token-env, and
ephemeral browser command-plan checks, the helper MUST require the host command
to include exactly one `--host-apply-input true` marker and exactly one
`--dev-screen-frame-source windows-capture` marker, and MUST require the viewer
command to include the reviewed `screen:view,input:pointer,input:keyboard`
request plus the reviewed latest-frame output path. The validation MUST remain
non-executing and MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows
prompt bypass, or hidden-session behavior. Failure output MUST remain bounded
and MUST NOT echo generated command strings, relay URLs, local URLs, ports,
token references, token values, token environment values, pairing codes, local
paths, stdout, stderr, child output, credentials, frame bytes, screen contents,
input contents, clipboard contents, or full secrets.

#### Scenario: Default ready accepts reviewed native control path

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper accepts the non-executing command-plan checks only when
  the host command preserves the reviewed Windows capture and host input
  markers
- **AND** the viewer command preserves the reviewed screen/input request and
  latest-frame output markers
- **AND** output reports only bounded fixed status metadata for those checks

#### Scenario: Native control command-plan drift fails closed

- **WHEN** a full session command-plan omits, duplicates, or changes the
  reviewed host input marker, host Windows capture marker, viewer screen/input
  request marker, or viewer latest-frame output marker
- **THEN** `mvp:ready` treats the matching command-plan check as failed
- **AND** diagnostics do not echo the unsafe command string, relay URL, local
  URL, token reference, token value, pairing code, path, stdout, stderr, child
  output, credential, screen content, input content, or full secret

#### Scenario: Native control validation stays non-executing

- **WHEN** `mvp:ready` validates default, LAN, token, or ephemeral
  command-plan JSON
- **THEN** it only parses the command kit JSON output
- **AND** it does not execute the generated relay, host, viewer, browser,
  capture, or input commands
