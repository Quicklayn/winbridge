## ADDED Requirements

### Requirement: Agent shell signal probes include bounded kind metadata

The managed agent shell runtime SHALL include bounded non-secret top-level `payload.kind` classifier metadata on built-in development signal probe messages and built-in host signal probe acknowledgement messages. A viewer-originated development signal probe MUST use `payload.kind` set to `viewer-signal-probe`, and a host-originated development signal probe acknowledgement MUST use `payload.kind` set to `host-signal-probe-ack`. The classifier metadata MUST NOT replace the existing active visible `screen:view` authorization, current authorization id, trusted peer authority, recipient routing, pause, revoke, terminate, expiration, local disconnect, remote disconnect, relay validation, or signal marker checks. Runtime events, logs, status snapshots, relay errors, and audit output MUST continue to omit raw signal payload contents unless a future OpenSpec change explicitly introduces bounded signal kind observability.

#### Scenario: Viewer probe includes bounded kind metadata

- **WHEN** a viewer runtime sends the built-in development signal probe after observing active visible `screen:view` authorization
- **THEN** the signal payload includes top-level `kind=viewer-signal-probe` and the current top-level `authorizationId`
- **AND** sending the probe MUST still require the existing active visible authorization, current recipient, and signal safety gates
- **AND** runtime diagnostics MUST NOT expose the raw probe marker, raw signal payload values, peer display names, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Host acknowledgement includes bounded kind metadata

- **WHEN** a host runtime sends the built-in signal probe acknowledgement after receiving a trusted viewer probe for the current active visible `screen:view` authorization
- **THEN** the acknowledgement signal payload includes top-level `kind=host-signal-probe-ack` and the current top-level `authorizationId`
- **AND** sending the acknowledgement MUST still require the existing active visible authorization, trusted viewer peer, current recipient, and signal safety gates
- **AND** runtime diagnostics MUST NOT expose the raw acknowledgement marker, raw signal payload values, peer display names, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Signal kind metadata is non-authorizing

- **WHEN** a signal payload contains `kind=viewer-signal-probe` or `kind=host-signal-probe-ack`
- **THEN** that kind metadata alone MUST NOT make the signal trusted, grant permissions, start capture, send input, start signaling, reconnect peers, invoke host controls, bypass consent workflows, or bypass the existing marker and authorization checks
- **AND** stale, mismatched, missing-authorization, wrong-peer, paused, revoked, terminated, expired, invisible, locally disconnected, or remotely disconnected signal paths MUST continue to fail closed
