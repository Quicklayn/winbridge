## ADDED Requirements

### Requirement: Agent status snapshot documentation
The project documentation SHALL describe managed host and viewer status APIs as returning immutable read-only local metadata snapshots. The documentation MUST state that status snapshots are bounded, non-authorizing, and cannot be used to grant permissions, change authorization lifecycle state, start signaling, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows.

#### Scenario: Host status documentation is immutable and non-authorizing
- **WHEN** a developer reads the host status CLI or runtime documentation
- **THEN** the documentation describes host status as an immutable read-only local snapshot
- **AND** the documentation states that reading or mutating the snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows

#### Scenario: Viewer status documentation is immutable and non-authorizing
- **WHEN** a developer reads the viewer status CLI or runtime documentation
- **THEN** the documentation describes viewer status as an immutable read-only local snapshot
- **AND** the documentation states that reading or mutating the snapshot MUST NOT send protocol messages, emit workflow audit events, grant permissions, start signaling, reconnect peers, invoke host controls, start capture, send input, or bypass consent workflows

#### Scenario: Signal acknowledgement status documentation is immutable and non-authorizing
- **WHEN** a developer reads documentation for `signalProbeAckReceived`
- **THEN** the documentation describes the flag as bounded local metadata on an immutable viewer status snapshot
- **AND** the documentation states that the flag MUST NOT expose raw signal payloads or authorize signaling, capture, input, clipboard, file transfer, diagnostics, reconnect, host controls, or consent bypass
