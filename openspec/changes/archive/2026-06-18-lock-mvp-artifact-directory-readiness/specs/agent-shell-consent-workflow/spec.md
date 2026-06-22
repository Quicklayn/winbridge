## MODIFIED Requirements

### Requirement: Agent shell viewer writes consent-bound screen frames to an explicit output file

The agent shell CLI SHALL expose an explicit viewer-only latest-frame file
output for development MVP checks. The output path MUST be configured through
the validated `--viewer-screen-frame-output` option, the viewer MUST request
`screen:view`, and the viewer MUST configure local audit persistence before the
runtime starts. The runtime MUST persist frame bytes only after inbound
`screen-frame` sender role, target peer, authorization id, active visible
unexpired authorization, `screen:view` permission, and metadata-only output
audit gates pass. Each latest-frame update MUST create the configured output
directory recursively before publishing complete frame bytes by writing to a
same-directory temporary file and then replacing the configured output path; the
local viewer surface MUST NOT be able to read a partially written frame as
trusted current state. Output writes, logs, local events, HTTP responses, and
audit records MUST NOT expose raw frame bytes, encoded frame data, screenshots,
screen contents, credentials, tokens, pairing codes, private reasons, or full
secrets.

#### Scenario: Viewer writes a complete latest frame

- **WHEN** a viewer with configured latest-frame output receives an authorized
  inbound `screen-frame` and metadata-only output audit succeeds
- **THEN** it creates the configured output directory recursively before writing
  the decoded frame bytes to a temporary file in that directory
- **AND** it replaces the configured latest-frame path only after the full frame
  write succeeds
- **AND** the configured latest-frame path contains either the previous complete
  frame or the new complete frame, never a partially written frame
- **AND** diagnostics and audit remain metadata-only

#### Scenario: Latest-frame replacement fails

- **WHEN** the runtime cannot create the configured output directory, write the
  temporary frame file, or replace the configured latest-frame path
- **THEN** it fails closed before treating the new frame as published
- **AND** the failure MUST NOT send protocol messages, grant permissions,
  reconnect peers, start capture, send input, hide the host session, bypass
  consent, or expose raw frame bytes, encoded frame data, screenshots, screen
  contents, credentials, tokens, pairing codes, private reasons, or full secrets
