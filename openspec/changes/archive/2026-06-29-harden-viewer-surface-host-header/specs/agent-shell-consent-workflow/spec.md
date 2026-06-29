## ADDED Requirements

### Requirement: Viewer local surface validates loopback Host header

The opt-in viewer local control surface SHALL reject every request whose `Host`
header is missing or does not exactly match the resolved loopback surface host
and port. Host-header rejection MUST happen before serving HTML, sanitized
status, frame bytes, input requests, or disconnect requests. Rejection responses
MUST be bounded and MUST NOT expose mutation tokens, authorization IDs, frame
paths, frame bytes, local file paths, command contents, input contents, requested
host names, credentials, or raw diagnostics.

#### Scenario: Canonical loopback host is accepted

- **WHEN** the viewer local control surface is started on its resolved
  `127.0.0.1:<port>` URL
- **THEN** requests using that exact `Host` value can reach the existing
  route-specific HTML, status, frame, input, and disconnect checks

#### Scenario: Mismatched host is rejected before read data

- **WHEN** a request for `/`, `/status`, or `/frame` uses a different `Host`
  value from the resolved loopback surface URL
- **THEN** the surface rejects the request before serving HTML, status, or frame
  bytes
- **AND** the response does not expose tokens, authorization IDs, frame bytes,
  local file paths, or the provided host name

#### Scenario: Mismatched host is rejected before mutation behavior

- **WHEN** a request for `/input` or `/disconnect` uses a different or missing
  `Host` value
- **THEN** the surface rejects the request before reading authorization state,
  sending input events, or leaving the viewer runtime
- **AND** the response does not expose command contents, input contents,
  mutation tokens, or the provided host name
