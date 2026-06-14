## ADDED Requirements

### Requirement: Single pairing join timestamp
The relay SHALL evaluate viewer pairing ticket consumption and paired-device record creation using the same relay decision timestamp for a single viewer join attempt. The shared timestamp MUST NOT grant access after ticket expiration, revive consumed tickets, allow pairing-code mismatch, allow self-pairing, start capture, send input, reconnect peers, or bypass host consent workflows.

#### Scenario: Viewer pairing uses one timestamp before expiry
- **WHEN** a host-created pairing ticket is still valid at the relay decision timestamp and the viewer presents the matching pairing credential
- **THEN** the relay consumes the ticket and records the paired device using that same timestamp before registering the viewer

#### Scenario: Expired viewer pairing remains denied
- **WHEN** the relay decision timestamp is at or after the pairing ticket expiration
- **THEN** the relay rejects the viewer before registration and does not create a paired-device record
