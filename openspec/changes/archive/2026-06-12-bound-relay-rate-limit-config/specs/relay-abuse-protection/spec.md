## MODIFIED Requirements

### Requirement: Development-only limiter configuration
The relay SHALL expose simple environment configuration for development rate-limit windows and limits while documenting that production needs distributed abuse protection. Configured rate-limit limit and window values SHALL be canonical positive decimal integers with no leading zeros. Configured rate-limit limits MUST be from `1` through `1_000_000`. Configured rate-limit windows MUST be from `1000` through `2_147_483_647` milliseconds.

#### Scenario: Rate limit environment is omitted
- **WHEN** no rate-limit environment variables are set
- **THEN** the relay uses safe development defaults

#### Scenario: Rate limit environment is canonical
- **WHEN** a rate-limit limit environment variable is set to a canonical positive decimal integer from `1` through `1_000_000`
- **AND** a rate-limit window environment variable is set to a canonical positive decimal integer from `1000` through `2_147_483_647`
- **THEN** the relay uses those configured values for the development limiter

#### Scenario: Malformed rate limit environment is rejected
- **WHEN** a rate-limit limit or window environment variable is empty, partial, fractional, negative, zero where a positive value is required, below the minimum window, above the safe development bound, or contains leading zeros
- **THEN** the relay rejects the configuration before using the limiter
