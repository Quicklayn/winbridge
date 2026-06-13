## MODIFIED Requirements

### Requirement: Managed relay lifecycle
The development relay SHALL expose a managed runtime with explicit start and stop operations. The managed runtime SHALL reject malformed injected port configuration before creating a listener or opening a listening socket. The managed runtime SHALL emit accepted development-mode startup audit records only after the listener has successfully started, and SHALL reject duplicate active start attempts before opening another listener attempt, writing another startup audit record, or logging another development-mode warning.

#### Scenario: Runtime starts on ephemeral port
- **WHEN** tests start the relay runtime with port `0`
- **THEN** the runtime listens on an available local port and reports its WebSocket URL

#### Scenario: Runtime stops
- **WHEN** tests stop the relay runtime
- **THEN** the WebSocket server and HTTP server are closed

#### Scenario: Runtime rejects malformed port configuration
- **WHEN** the relay is configured with a malformed, negative, fractional, non-finite, or out-of-range injected port value
- **THEN** it rejects the configuration before creating a listener, opening a listening socket, or accepting peer connections

#### Scenario: Development-mode start audit follows successful listener bind
- **WHEN** the relay runtime starts without a shared token and the listener binds successfully
- **THEN** the runtime emits exactly one accepted `relay.start.development-mode` audit event for that start

#### Scenario: Failed listener bind does not emit accepted start audit
- **WHEN** the relay runtime starts without a shared token and the listener bind fails
- **THEN** the runtime MUST NOT emit an accepted `relay.start.development-mode` audit event for that failed start

#### Scenario: Startup audit failure closes listener
- **WHEN** the relay runtime starts without a shared token and accepted startup audit emission fails after the listener binds
- **THEN** the runtime rejects startup and closes the listener before accepting peer connections

#### Scenario: Duplicate active start is rejected before start side effects
- **WHEN** `start()` is called again while the same relay runtime is already starting or started
- **THEN** the runtime rejects the duplicate start before opening another listener attempt, writing another startup audit event, or logging another development-mode warning
