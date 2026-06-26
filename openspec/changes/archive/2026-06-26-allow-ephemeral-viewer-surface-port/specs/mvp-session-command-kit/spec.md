## ADDED Requirements

### Requirement: Command kit supports explicit ephemeral viewer surface port

The MVP command kit SHALL accept `--viewer-control-surface-port 0` as an
explicit ephemeral local viewer surface mode while preserving the default fixed
port `35987`. When the configured viewer surface port is `0`, the rendered
viewer command SHALL pass `--viewer-control-surface-port '0'`, and the rendered
browser step SHALL instruct the operator to open the loopback URL printed by
the viewer command log instead of printing a fabricated fixed URL. The command
kit MUST remain non-executing and MUST NOT start browsers, bind sockets, probe
ports, expose mutation tokens, or echo unsafe input.

#### Scenario: Default browser command remains fixed-port

- **WHEN** a developer runs the command kit without overriding the viewer
  surface port
- **THEN** the browser step remains `Start-Process
  'http://127.0.0.1:35987/'`
- **AND** the viewer command uses `--viewer-control-surface-port '35987'`

#### Scenario: Ephemeral browser step points to viewer log

- **WHEN** a developer runs the command kit with
  `--viewer-control-surface-port 0`
- **THEN** the viewer command uses `--viewer-control-surface-port '0'`
- **AND** the browser step instructs the operator to open the URL printed by
  the viewer command log
- **AND** output MUST NOT include a fabricated `http://127.0.0.1:0/` URL,
  mutation token, raw command output, credentials, screen contents, input
  contents, or full secrets
