## ADDED Requirements

### Requirement: Registered recipient targeting
The relay SHALL reject registered-peer messages before forwarding when no remaining registered recipient is available or when an explicit target peer id does not match the remaining recipient in the two-party room.

#### Scenario: Registered peer sends with no recipient
- **WHEN** a registered peer sends an ordinary peer message before the other peer has joined or after the other peer has left
- **THEN** the relay rejects the message before forwarding and MUST NOT record it as an accepted remote-assistance delivery

#### Scenario: Signal targets wrong peer
- **WHEN** a registered peer sends a `signal` message with `toPeerId` set to itself, an unknown peer, or any peer other than the remaining registered recipient
- **THEN** the relay rejects the message before forwarding it

#### Scenario: Host decision targets wrong viewer
- **WHEN** a registered host sends a host consent or session authorization decision whose `viewerPeerId` does not identify the remaining registered viewer
- **THEN** the relay rejects the message before forwarding it

#### Scenario: Recipient targeting rejection is secret-safe
- **WHEN** the relay rejects a message for missing recipient or target mismatch
- **THEN** the peer-facing relay error and audit reason MUST use bounded metadata-only text and MUST NOT include raw pairing codes, tokens, credentials, protocol payloads, private reasons, keystrokes, screenshots, screen contents, or full secrets
