## ADDED Requirements

### Requirement: Viewer local surface supports explicit ephemeral loopback port

The agent shell SHALL accept `--viewer-control-surface-port 0` only for the
existing viewer-only local surface path that also requires explicit
`--viewer-screen-frame-output`, local audit configuration, and requested
`screen:view`. When `0` is configured, the surface SHALL bind only to
`127.0.0.1` with an OS-assigned ephemeral port, resolve the actual listener
port after successful startup, and log only the bounded loopback URL for the
operator to open. The surface MUST NOT bind to LAN interfaces, expose mutation
tokens, start hidden browser processes, bypass consent, or weaken runtime
authorization and audit gates.

#### Scenario: Ephemeral viewer surface port resolves to loopback URL

- **WHEN** a viewer starts the local control surface with
  `--viewer-control-surface-port 0` and all existing viewer frame-output gates
  pass
- **THEN** the local surface listens on `127.0.0.1` with an assigned TCP port
- **AND** the logged URL uses `http://127.0.0.1:<resolved-port>/`
- **AND** logs and status output MUST NOT expose mutation tokens, frame bytes,
  pairing codes, credentials, raw command bodies, screen contents, input
  contents, clipboard contents, or full secrets

#### Scenario: Ephemeral viewer surface port preserves existing denials

- **WHEN** `--viewer-control-surface-port 0` is used by a host, without frame
  output, without `screen:view`, or without local audit configuration
- **THEN** parsing fails before relay startup
- **AND** diagnostics remain bounded and do not echo raw unsafe input
