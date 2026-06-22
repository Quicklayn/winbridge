## MODIFIED Requirements

### Requirement: Local viewer surface displays only the configured latest frame
The local viewer surface SHALL serve frame bytes only from the already
validated `--viewer-screen-frame-output` path after the viewer runtime has
persisted authorized inbound frame bytes there during the current local surface
run. The surface MUST clear the configured latest-frame path during startup or
fail closed, and it MUST return not-ready until the current run has a persisted
complete frame. The generated page MUST display bounded local frame readiness
state that distinguishes frame availability from viewer authorization status
and MUST NOT expose frame paths, frame bytes, screen contents, raw error bodies,
tokens, pairing codes, private reasons, or diagnostics. It MUST NOT accept path
parameters, browse directories, read arbitrary files, read same-directory
temporary frame output files, cache stale frames as trusted state, or expose raw
frame bytes through logs or diagnostics. The surface MUST choose a bounded
`image/jpeg` or `image/png` content type from recognized JPEG/PNG byte
signatures before falling back to the configured file extension.

#### Scenario: Local surface ignores temporary frame output

- **WHEN** the viewer output sink has created a same-directory temporary frame
  file but has not replaced the configured latest-frame path
- **THEN** the local viewer surface reads only the configured latest-frame path
  and returns the previous complete frame or not-ready
- **AND** the generated page displays only bounded frame readiness state
- **AND** it MUST NOT read, serve, log, delete, or expose the temporary file
  through HTTP responses, page text, or diagnostics

#### Scenario: Local surface reports frame readiness

- **WHEN** the generated local viewer page refreshes the configured latest frame
- **THEN** it displays bounded loading, ready, or not-ready frame state based on
  the same `/frame` image request result
- **AND** the readiness text MUST NOT expose frame paths, frame bytes, screen
  contents, raw error bodies, tokens, pairing codes, private reasons, or
  diagnostics
