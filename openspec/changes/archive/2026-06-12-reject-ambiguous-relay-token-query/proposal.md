## Why

The development relay currently reads shared-token access with `URLSearchParams.get("token")`. A WebSocket URL can carry duplicate `token` query parameters, which creates ambiguous credential presentation. Relay credential checks should be deterministic and fail closed before any session join state is created.

## What Changes

- Reject token-protected relay connections unless the request URL contains exactly one `token` query parameter.
- Keep missing tokens and wrong tokens rejected before room registration.
- Keep successful single-token connections unchanged.
- Keep token denial audit records secret-safe and free of raw presented or configured tokens.
- Document that relay token query presentation must be singular and that production deployments still need real identity and authorization.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-broker`: development relay token checks reject ambiguous duplicate token query parameters.
- `relay-runtime`: integration coverage proves duplicate token query parameters fail closed and are audited without raw token values.

## Impact

- Affected code: relay shared-token validation and relay integration tests.
- Affected docs/specs: README, security/architecture docs, OpenSpec specs.
- Affected systems: local development relay connection setup when `WINBRIDGE_RELAY_SHARED_TOKEN` is configured.
- Safety impact: removes an ambiguous credential input path before relay room registration. This does not add capture, input, clipboard sync, file transfer, diagnostics export, installer, startup, service, credential collection, or privilege behavior.
