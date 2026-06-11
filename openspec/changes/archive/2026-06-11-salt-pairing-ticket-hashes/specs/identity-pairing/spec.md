## MODIFIED Requirements

### Requirement: Expiring pairing ticket
The system SHALL model pairing material as an expiring, replay-resistant ticket that stores a per-ticket salted hash of the pairing code instead of the raw code.

#### Scenario: Pairing ticket is created
- **WHEN** the host creates pairing material for a session
- **THEN** the resulting ticket contains session id, host device id, pairing-code salt, salted pairing-code hash, creation time, expiration time, and remaining uses

#### Scenario: Pairing ticket is expired
- **WHEN** a peer attempts to use a pairing ticket after its expiration time
- **THEN** the system rejects the ticket before authorizing session access

#### Scenario: Pairing ticket omits raw secret
- **WHEN** a pairing ticket is serialized or audited
- **THEN** the raw pairing code is not present in the ticket or audit details

#### Scenario: Same code creates different ticket hashes
- **WHEN** two pairing tickets are created with the same raw pairing code
- **THEN** each ticket has a distinct pairing-code salt and salted pairing-code hash

### Requirement: Development relay pairing ticket lifecycle
The development relay SHALL use host-created expiring pairing tickets with per-ticket salted pairing-code hashes for viewer room joins and SHALL NOT store raw pairing codes in relay peer state.

#### Scenario: Host creates relay pairing ticket
- **WHEN** a host joins a relay session with a pairing credential
- **THEN** the relay creates an in-memory pairing ticket containing the session id, host device id, pairing-code salt, salted pairing-code hash, creation time, expiration time, and remaining uses

#### Scenario: Viewer consumes relay pairing ticket
- **WHEN** a viewer joins with the matching pairing credential before the ticket expires and while uses remain
- **THEN** the relay consumes one ticket use before registering the viewer in the room

#### Scenario: Viewer presents mismatched credential
- **WHEN** a viewer joins with a pairing credential that does not match the host-created ticket
- **THEN** the relay rejects the join before registering the viewer and does not expose the raw credential in audit output

#### Scenario: Viewer presents expired credential
- **WHEN** a viewer joins after the host-created pairing ticket expires
- **THEN** the relay rejects the join before registering the viewer

#### Scenario: Viewer presents consumed credential
- **WHEN** a viewer joins after the host-created pairing ticket has no remaining uses
- **THEN** the relay rejects the join before registering the viewer

#### Scenario: Pairing does not grant remote action access
- **WHEN** a viewer successfully consumes a relay pairing ticket
- **THEN** the relay treats the viewer as joined only and does not grant screen, input, clipboard, file, diagnostic, or other sensitive action permissions
