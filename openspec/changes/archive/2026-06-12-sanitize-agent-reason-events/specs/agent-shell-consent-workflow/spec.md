## ADDED Requirements

### Requirement: Runtime event reasons are secret-safe
The agent shell SHALL emit local `sent` and `received` runtime events without exposing raw protocol `reason` text from authorization, permission, lifecycle, control, or other reason-bearing protocol messages.

#### Scenario: Sent protocol reason is redacted
- **WHEN** the managed runtime sends a protocol message with a `reason` field
- **THEN** the local `sent` runtime event MUST preserve the message type and consent workflow metadata but MUST NOT expose the raw reason text

#### Scenario: Received protocol reason is redacted
- **WHEN** the managed runtime receives a valid protocol message with a `reason` field
- **THEN** the local `received` runtime event MUST preserve the message type and consent workflow metadata but MUST NOT expose the raw reason text

#### Scenario: Wire behavior is unchanged
- **WHEN** the managed runtime sends or handles reason-bearing protocol messages
- **THEN** reason redaction MUST apply only to the local runtime event view and MUST NOT change protocol validation, socket send behavior, relay forwarding, or internal workflow handling
