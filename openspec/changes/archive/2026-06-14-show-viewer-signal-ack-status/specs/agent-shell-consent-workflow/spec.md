## ADDED Requirements

### Requirement: Viewer signal acknowledgement status is bounded and read-only

The managed viewer agent shell runtime SHALL expose optional viewer status metadata after receiving a trusted host signal probe acknowledgement for the current active visible `screen:view` authorization. The metadata MUST be bounded to `signalProbeAckReceived=true` and MUST NOT expose raw signal payload markers, payload keys, payload values, peer ids, display names, private reasons, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, input contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, raw protocol data, or raw WebSocket close reason text. Reading or printing the status MUST NOT send protocol messages, emit workflow audit events, grant permissions, start capture, send input, start signaling, reconnect peers, invoke host controls, or bypass consent workflows.

#### Scenario: Viewer status reports trusted host acknowledgement

- **WHEN** a viewer runtime with active visible `screen:view` authorization receives a trusted host signal probe acknowledgement for the same authorization id
- **THEN** viewer status includes `signalProbeAckReceived=true`
- **AND** the status output MUST NOT expose the raw acknowledgement payload marker or any raw signal payload contents

#### Scenario: Viewer status omits acknowledgement before trusted acknowledgement

- **WHEN** a viewer runtime has active visible `screen:view` authorization but has not received a trusted matching host signal probe acknowledgement
- **THEN** viewer status omits signal acknowledgement metadata
- **AND** the omitted metadata MUST NOT grant permissions, start capture, send input, start signaling, reconnect peers, invoke host controls, or bypass consent workflows

#### Scenario: Viewer status clears acknowledgement after authorization loss

- **WHEN** a viewer runtime previously received a trusted host signal probe acknowledgement
- **AND** the viewer authorization becomes paused, revoked, terminated, expired, locally disconnected, remotely disconnected, socket-closed, invisible, or no longer includes `screen:view`
- **THEN** viewer status omits signal acknowledgement metadata
- **AND** stale acknowledgement metadata MUST NOT authorize signaling, capture, input, clipboard, file transfer, diagnostics, reconnect, host controls, or consent bypass
