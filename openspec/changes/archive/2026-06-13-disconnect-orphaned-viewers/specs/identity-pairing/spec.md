## ADDED Requirements

### Requirement: Replacement host pairing scope is fresh
The development relay SHALL tie host-created pairing tickets to the current live host room lifecycle. When a host disconnects, any viewer paired under that host's ticket MUST NOT be reused as a paired viewer for a later replacement host. The replacement host's pairing ticket MUST be consumed by a viewer join or rejoin before the relay treats the replacement host and viewer as a paired room.

#### Scenario: Stale viewer cannot consume replacement pairing implicitly
- **WHEN** a viewer consumed a previous host pairing ticket and the previous host disconnects
- **THEN** the viewer's previous paired state MUST NOT satisfy the replacement host's pairing ticket

#### Scenario: Replacement host pairing is consumed by rejoin
- **WHEN** the replacement host creates a new relay pairing ticket and a viewer joins with that current pairing credential
- **THEN** the relay consumes the replacement host's ticket before registering the viewer in the replacement room
