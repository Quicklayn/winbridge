## MODIFIED Requirements

### Requirement: Local viewer surface displays only the configured latest frame

The local viewer surface SHALL serve generated HTML for a loopback-only viewer
page and SHALL serve the current configured latest-frame file through a fixed
`/frame` endpoint only after the file is available for the current surface run.
The generated page SHALL poll only bounded local status metadata and the fixed
frame endpoint. The generated page MAY display the bounded
`signalProbeAckReceived=true` viewer status flag when present, but MUST NOT
expose authorization ids, raw signal payload markers, payload keys, payload
values, peer ids, display names, private reasons, tokens, pairing codes,
credentials, screen contents, input contents, clipboard contents,
file-transfer contents, diagnostics dumps, or raw protocol data. The generated
page MUST NOT treat signal acknowledgement status as authorization or as
permission to send input; input authorization remains enforced by the existing
runtime gates.

#### Scenario: Local surface shows bounded signal acknowledgement readiness

- **WHEN** the local viewer page polls `/status` and receives
  `signalProbeAckReceived=true`
- **THEN** the visible local status text includes
  `signalProbeAckReceived=true`
- **AND** it MUST NOT include raw signal markers, authorization ids, peer ids,
  display names, tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, file-transfer contents, or
  diagnostics dumps
- **AND** displaying the flag MUST NOT send protocol messages, grant
  permissions, start capture, send input, invoke host controls, reconnect
  peers, or bypass consent
