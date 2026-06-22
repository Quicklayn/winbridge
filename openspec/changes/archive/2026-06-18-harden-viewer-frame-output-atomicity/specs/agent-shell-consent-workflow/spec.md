## MODIFIED Requirements

### Requirement: Agent shell viewer writes consent-bound screen frames to an explicit output file

The agent shell CLI SHALL expose an explicit viewer-only latest-frame file
output for development MVP checks. The output path MUST be configured through
the validated `--viewer-screen-frame-output` option, the viewer MUST request
`screen:view`, and the viewer MUST configure local audit persistence before the
runtime starts. The runtime MUST persist frame bytes only after inbound
`screen-frame` sender role, target peer, authorization id, active visible
unexpired authorization, `screen:view` permission, and metadata-only output
audit gates pass. Each latest-frame update MUST publish complete frame bytes by
writing to a same-directory temporary file and then replacing the configured
output path; the local viewer surface MUST NOT be able to read a partially
written frame as trusted current state. Output writes, logs, local events, HTTP
responses, and audit records MUST NOT expose raw frame bytes, encoded frame
data, screenshots, screen contents, credentials, tokens, pairing codes, private
reasons, or full secrets.

#### Scenario: Viewer writes a complete latest frame

- **WHEN** a viewer with configured latest-frame output receives an authorized
  inbound `screen-frame` and metadata-only output audit succeeds
- **THEN** it writes the decoded frame bytes to a temporary file in the output
  directory and replaces the configured latest-frame path only after the full
  frame write succeeds
- **AND** the configured latest-frame path contains either the previous complete
  frame or the new complete frame, never a partially written frame
- **AND** diagnostics and audit remain metadata-only

#### Scenario: Latest-frame replacement fails

- **WHEN** the runtime cannot write or replace the configured latest-frame path
- **THEN** it fails closed before treating the new frame as published
- **AND** the failure MUST NOT send protocol messages, grant permissions,
  reconnect peers, start capture, send input, hide the host session, bypass
  consent, or expose raw frame bytes, encoded frame data, screenshots, screen
  contents, credentials, tokens, pairing codes, private reasons, or full secrets

### Requirement: Local viewer surface displays only the configured latest frame

The local viewer surface SHALL serve frame bytes only from the already
validated `--viewer-screen-frame-output` path after the viewer runtime has
persisted authorized inbound frame bytes there during the current local surface
run. The surface MUST clear the configured latest-frame path during startup or
fail closed, and it MUST return not-ready until the current run has a persisted
complete frame. It MUST NOT accept path parameters, browse directories, read
arbitrary files, read same-directory temporary frame output files, cache stale
frames as trusted state, or expose raw frame bytes through logs or diagnostics.
The surface MUST choose a bounded `image/jpeg` or `image/png` content type from
recognized JPEG/PNG byte signatures before falling back to the configured file
extension.

#### Scenario: Local surface ignores temporary frame output

- **WHEN** the viewer output sink has created a same-directory temporary frame
  file but has not replaced the configured latest-frame path
- **THEN** the local viewer surface reads only the configured latest-frame path
  and returns the previous complete frame or not-ready
- **AND** it MUST NOT read, serve, log, delete, or expose the temporary file
  through HTTP responses or diagnostics
