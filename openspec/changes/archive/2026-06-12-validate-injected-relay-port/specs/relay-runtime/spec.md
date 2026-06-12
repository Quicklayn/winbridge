## MODIFIED Requirements

### Requirement: Managed relay lifecycle
The development relay SHALL expose a managed runtime with explicit start and stop operations. The managed runtime SHALL reject malformed injected port configuration before creating a listener or opening a listening socket.

#### Scenario: Runtime starts on ephemeral port
- **WHEN** tests start the relay runtime with port `0`
- **THEN** the runtime listens on an available local port and reports its WebSocket URL

#### Scenario: Runtime stops
- **WHEN** tests stop the relay runtime
- **THEN** the WebSocket server and HTTP server are closed

#### Scenario: Runtime rejects malformed port configuration
- **WHEN** the relay is configured with a malformed, negative, fractional, non-finite, or out-of-range injected port value
- **THEN** it rejects the configuration before creating a listener, opening a listening socket, or accepting peer connections
