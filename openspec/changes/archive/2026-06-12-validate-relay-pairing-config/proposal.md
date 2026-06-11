## Why

Development relay pairing ticket TTL and max-use settings control how long viewer admission material remains usable and how many joins it can satisfy. These values should fail fast when malformed or overly permissive instead of silently falling back or reaching ticket creation with unsafe settings.

## What Changes

- Parse `WINBRIDGE_RELAY_PAIRING_TICKET_TTL_MS` and `WINBRIDGE_RELAY_PAIRING_TICKET_MAX_USES` as exact bounded integer environment values.
- Reject empty, partial, fractional, negative, or out-of-range pairing configuration before opening the relay listener.
- Apply the same bounded validation to injected relay pairing settings used by tests and managed runtime callers.
- Preserve omitted environment defaults and existing host-created pairing ticket behavior.
- Non-goals: no production identity system, no account/device trust changes, no reconnect policy, no capture/input behavior, no installer/startup/service behavior, no shared-token/auth changes, and no changes to consent or authorization semantics.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `relay-runtime`: pairing ticket runtime configuration must reject malformed or unsafe TTL and max-use values before relay startup or room use.

## Impact

- Affected code: `apps/relay/src/server.ts`, `apps/relay/src/rooms.ts`, relay integration/unit tests, README/security documentation, and OpenSpec specs.
- Affected systems: development relay pairing ticket configuration and test-injected pairing settings.
- Safety impact: limits accidental long-lived or unusable pairing admission windows and keeps pairing as a fail-closed prerequisite that does not grant remote action permissions.
- Security review: required because this touches relay admission and pairing behavior.
