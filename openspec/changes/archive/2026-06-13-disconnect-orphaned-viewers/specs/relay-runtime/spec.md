## ADDED Requirements

### Requirement: Runtime prevents stale viewer reuse after host disconnect
The relay runtime SHALL expose tests proving a remaining viewer from a previous host pairing scope cannot be reused as the recipient for a replacement host. Runtime cleanup and rejection audit records MUST remain secret-safe and MUST NOT include raw pairing codes, tokens, protocol payloads, private reasons, keystrokes, screenshots, screen contents, or full secrets.

#### Scenario: Replacement host does not inherit old viewer
- **WHEN** integration tests register a host and viewer, close the host, and then join a replacement host for the same session with a new pairing code
- **THEN** the replacement host receives `relay-ready` with room size `1`
- **AND** the old viewer receives no replacement-host peer messages without reconnecting through the new pairing credential

#### Scenario: Stale viewer forwarding is rejected
- **WHEN** a stale viewer socket sends a peer message after host disconnect cleanup
- **THEN** the runtime rejects it before forwarding to a replacement host
- **AND** the rejection audit metadata remains bounded and secret-safe
