## MODIFIED Requirements

### Requirement: Development relay token
The relay SHALL support an optional shared token for local/private development and SHALL document that production deployments require stronger identity and authorization.

#### Scenario: Shared token configured
- **WHEN** the relay is started with a shared token
- **THEN** peers without the matching token are rejected before joining a session room

#### Scenario: Shared token omitted
- **WHEN** the relay is started without a shared token
- **THEN** the relay starts in development mode and logs a warning that it is not production authorization

#### Scenario: Blank shared token is rejected
- **WHEN** the relay is configured with an empty or whitespace-only shared token
- **THEN** the relay rejects the configuration before accepting peer connections
