## MODIFIED Requirements

### Requirement: Development-only limiter configuration
The relay SHALL expose simple environment configuration for development rate-limit windows and limits while documenting that production needs distributed abuse protection. Configured rate-limit limit and window values SHALL be canonical positive decimal integers with no leading zeros.

#### Scenario: Rate limit environment is omitted
- **WHEN** no rate-limit environment variables are set
- **THEN** the relay uses safe development defaults

#### Scenario: Rate limit environment is canonical
- **WHEN** a rate-limit limit or window environment variable is set to a canonical positive decimal integer that satisfies the required minimum
- **THEN** the relay uses that configured value for the development limiter

#### Scenario: Malformed rate limit environment is rejected
- **WHEN** a rate-limit limit or window environment variable is empty, partial, fractional, negative, zero where a positive value is required, below the minimum window, or contains leading zeros
- **THEN** the relay rejects the configuration before using the limiter
