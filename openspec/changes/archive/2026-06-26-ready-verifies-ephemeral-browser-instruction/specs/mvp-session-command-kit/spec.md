## ADDED Requirements

### Requirement: Ready helper validates ephemeral browser instruction

The root MVP ready helper SHALL include a default non-executing command-plan
validation for explicit ephemeral viewer surface mode by running the command kit
in bounded JSON mode with `--viewer-control-surface-port 0`. This validation
SHALL verify internally that the generated viewer command passes
`--viewer-control-surface-port '0'`, that the generated browser command is the
fixed instruction to open the local control surface URL printed by the viewer
command log, and that the command plan does not fabricate a
`http://127.0.0.1:0/` URL. The validation MUST stop after the first failure and
MUST report only fixed readiness check metadata and bounded reason codes. It
MUST NOT echo command strings, local URLs, ports, relay URLs, pairing codes,
token references, local paths, stdout, stderr, child output, mutation tokens,
credentials, screen contents, input contents, or full secrets. The validation
MUST remain non-executing and MUST NOT start relay, host, viewer, browser,
capture, input, sockets, HTTP listeners, services, startup persistence,
unattended access, privilege elevation, remote discovery, firewall changes,
AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Default ready accepts reviewed ephemeral browser instruction

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates the ordinary fixed-port command plan
- **AND** it validates the explicit ephemeral command plan
- **AND** the ephemeral validation passes only when the viewer command uses
  `--viewer-control-surface-port '0'`
- **AND** the browser command instructs the operator to open the URL printed by
  the viewer command log instead of using a fabricated port-zero URL

#### Scenario: Ephemeral command-plan drift fails closed

- **WHEN** the ephemeral command-plan output is missing the viewer port-zero
  flag, omits the fixed browser instruction, includes a fabricated
  `http://127.0.0.1:0/` URL, or contains malformed command-plan metadata
- **THEN** `mvp:ready` treats the `ephemeral-command-plan` check as failed
- **AND** output uses only fixed check status and bounded reason metadata
- **AND** diagnostics do not echo the unsafe command string, URL, port, token,
  pairing code, path, stdout, stderr, child output, credential, screen content,
  input content, or full secret

