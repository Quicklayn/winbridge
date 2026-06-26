## ADDED Requirements

### Requirement: Ready helper validates ephemeral browser-only output

The root MVP ready helper SHALL include a default non-executing text validation
for `mvp:commands -- --only browser --viewer-control-surface-port 0`. This
validation SHALL verify that the browser-only output includes the viewer-role
ready reminder, includes only the browser command block, includes the fixed
instruction to open the local control surface URL printed by the viewer command
log, and does not include a fabricated `http://127.0.0.1:0/` URL. The
validation MUST stop after the first failure and MUST report only fixed
readiness check metadata and bounded reason codes. It MUST NOT echo generated
command strings, local URLs, ports, relay URLs, pairing codes, token
references, local paths, stdout, stderr, child output, mutation tokens,
credentials, screen contents, input contents, or full secrets. The validation
MUST remain non-executing and MUST NOT start relay, host, viewer, browser,
capture, input, sockets, HTTP listeners, services, startup persistence,
unattended access, privilege elevation, remote discovery, firewall changes,
AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: Default ready accepts ephemeral browser-only output

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the helper validates the default browser role-filter output
- **AND** it validates the explicit ephemeral browser role-filter output
- **AND** the ephemeral browser output passes only when it instructs the
  operator to open the URL printed by the viewer command log
- **AND** the selected text block remains browser-only and non-executing

#### Scenario: Ephemeral browser-only drift fails closed

- **WHEN** the ephemeral browser-only output omits the fixed viewer-log
  instruction, includes `http://127.0.0.1:0/`, includes relay, host, or viewer
  runtime command blocks, or contains malformed role-filter metadata
- **THEN** `mvp:ready` treats the `ephemeral-role-filter-browser-command`
  check as failed
- **AND** output uses only fixed check status and bounded reason metadata
- **AND** diagnostics do not echo the unsafe command string, URL, port, token,
  pairing code, path, stdout, stderr, child output, credential, screen content,
  input content, or full secret

