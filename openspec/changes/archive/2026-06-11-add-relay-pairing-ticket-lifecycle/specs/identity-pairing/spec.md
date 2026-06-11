## ADDED Requirements

### Requirement: Development relay pairing ticket lifecycle
The development relay SHALL use host-created expiring pairing tickets for viewer room joins and SHALL NOT store raw pairing codes in relay peer state.

#### Scenario: Host creates relay pairing ticket
- **WHEN** a host joins a relay session with a pairing credential
- **THEN** the relay creates an in-memory pairing ticket containing the session id, host device id, pairing-code hash, creation time, expiration time, and remaining uses

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
