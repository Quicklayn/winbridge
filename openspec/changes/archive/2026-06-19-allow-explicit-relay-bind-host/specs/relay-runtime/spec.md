## MODIFIED Requirements

### Requirement: Managed relay lifecycle

The relay runtime SHALL start one WebSocket listener on a bounded configured
port and bind host, report a bounded local URL for development diagnostics, and
stop that listener on request. The default bind host SHALL be loopback-only.
Binding to all IPv4 interfaces SHALL require explicit opt-in through a bounded
configuration value. Malformed or unsupported bind hosts MUST fail before
listener startup, peer registration, pairing ticket creation, message
forwarding, capture, input, service, startup persistence, privilege, or
unattended behavior.

#### Scenario: Relay defaults to loopback bind
- **WHEN** the relay starts without bind-host configuration
- **THEN** it binds to `127.0.0.1`
- **AND** it does not expose the listener on non-loopback interfaces by default

#### Scenario: Relay explicitly binds for LAN development
- **WHEN** the relay starts with `WINBRIDGE_RELAY_BIND_HOST=0.0.0.0`
- **THEN** it binds the listener to `0.0.0.0`
- **AND** pairing, token, rate-limit, and protocol validation requirements still apply before any peer action

#### Scenario: Relay rejects unsafe bind hosts
- **WHEN** the bind-host configuration is blank, untrimmed, malformed, unsupported, or secret-bearing
- **THEN** the relay fails before listener startup
- **AND** diagnostics MUST NOT echo raw bind-host values, tokens, pairing codes, credentials, screen contents, keystrokes, or full secrets
