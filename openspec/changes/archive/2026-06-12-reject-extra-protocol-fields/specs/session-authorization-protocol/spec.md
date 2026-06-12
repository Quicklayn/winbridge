## ADDED Requirements

### Requirement: Authorization protocol envelopes reject unknown fixed fields
The protocol SHALL reject authorization and control protocol envelopes that include unknown fixed top-level fields before they can be forwarded or processed.

#### Scenario: Authorization request includes unknown fixed field
- **WHEN** a `session-authorization-request` includes an unknown top-level field
- **THEN** the protocol schema MUST reject the message before it can be forwarded or processed

#### Scenario: Authorization state includes unknown fixed field
- **WHEN** a `session-authorization-state` includes an unknown top-level field
- **THEN** the protocol schema MUST reject the message before peers can treat it as authorization state

#### Scenario: Session control includes unknown fixed field
- **WHEN** a `session-control` message includes an unknown top-level field
- **THEN** the protocol schema MUST reject the message before peers can process lifecycle intent
