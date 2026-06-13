## ADDED Requirements

### Requirement: Host disconnect clears paired viewer scope
The relay SHALL end the current two-party pairing scope when the registered host disconnects from a room that still contains a viewer. The relay MUST send the bounded host disconnect notice, remove the remaining viewer from room membership, and prevent that viewer socket from forwarding to or receiving from a replacement host unless the viewer reconnects and consumes the replacement host's current pairing ticket. This cleanup MUST NOT grant permissions, start capture, send input, reconnect a peer, preserve stale authorization, or bypass host consent.

#### Scenario: Host disconnect removes stale viewer membership
- **WHEN** a registered host and viewer are paired and the host disconnects
- **THEN** the relay sends the viewer a bounded `peer-disconnected` notice and removes the viewer from the room membership for that pairing scope
- **AND** the stale viewer MUST NOT count toward the room size for a later replacement host join

#### Scenario: Replacement host requires fresh viewer pairing
- **WHEN** a replacement host joins the same session after the previous host disconnected
- **THEN** the relay creates a fresh host pairing ticket and reports only the replacement host as registered
- **AND** a viewer must join or rejoin with the replacement host's current pairing credential before receiving replacement-host peer messages

#### Scenario: Stale viewer messages fail closed
- **WHEN** a stale viewer socket sends a peer message after host disconnect cleanup removed it from room membership
- **THEN** the relay rejects the message before forwarding
- **AND** the rejection MUST NOT expose raw pairing codes, tokens, protocol payloads, private reasons, keystrokes, screenshots, screen contents, or full secrets
