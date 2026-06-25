## ADDED Requirements

### Requirement: MVP smoke check supports explicit LAN-style relay mode

The root MVP smoke check SHALL support an explicit `--lan-relay` option that
runs the same bounded local static workflow while connecting host and viewer
through a loopback LAN-style relay URL using `127.0.0.1` and the smoke relay's
resolved port. The option SHALL remain local and development-scoped: it MUST
NOT discover local network addresses, probe remote hosts, open firewall ports,
invoke Windows capture, apply OS input, launch browser automation, install
services, configure startup persistence, elevate privileges, run unattended,
use relay tokens, expose raw relay URLs or ports in diagnostics, or hide the
host visible-session state. When invoked with `--json`, success and failure
output MUST use the same bounded smoke result shape as the default smoke mode.

#### Scenario: LAN-style smoke mode uses static local workflow

- **WHEN** a developer runs `npm run mvp:smoke -- --lan-relay`
- **THEN** the smoke check starts the bounded local development relay, host,
  and viewer processes with static frames and visible host authorization
- **AND** host and viewer connect through a `ws://127.0.0.1:<resolved-port>/`
  relay URL for the current smoke run
- **AND** it verifies frame, surface, signal, input, and audit readiness using
  the same bounded checks as the default smoke mode
- **AND** it stops all child processes before exiting

#### Scenario: LAN-style smoke output stays bounded

- **WHEN** the LAN-style smoke mode succeeds or fails with `--json`
- **THEN** the emitted JSON contains only bounded `ok`, optional safe reason,
  per-check status, and artifact cleanup metadata
- **AND** it MUST NOT include relay URLs, ports, frame paths, surface URLs,
  audit paths, mutation tokens, authorization ids, raw input commands, raw
  child output, tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

#### Scenario: LAN-style smoke mode remains local

- **WHEN** the LAN-style smoke mode prepares the relay URL
- **THEN** it uses the local smoke relay port and a fixed loopback host
  literal
- **AND** it MUST NOT discover LAN interfaces, connect to remote hosts, probe
  ports outside the local smoke workflow, configure firewall rules, bind a
  production service, or make the smoke helper an Internet-facing relay
