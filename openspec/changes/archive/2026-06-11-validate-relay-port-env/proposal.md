## Why

The relay entrypoint currently parses `WINBRIDGE_RELAY_PORT` with `Number.parseInt`, which accepts partial numeric strings and leaves invalid port ranges to fail later. Relay runtime configuration should fail closed with explicit validation before opening a listening socket.

## What Changes

- Add strict relay port environment parsing for `WINBRIDGE_RELAY_PORT`.
- Accept only exact integer TCP port values in the development runtime range, including `0` for test/ephemeral ports.
- Preserve the existing default port `8787`.
- Non-goals: no public bind-address change, no production deployment policy, no authentication or transport encryption change.

## Capabilities

### New Capabilities

### Modified Capabilities
- `relay-runtime`: Relay startup validates configured port values before listening.

## Impact

- Affected code: `apps/relay/src/server.ts`, `apps/relay/src/index.ts`, relay tests, OpenSpec artifacts, and docs if needed.
- Safety impact: networking-adjacent fail-fast configuration hardening. Does not add remote access capabilities or weaken consent, visibility, revocation, auth, or audit behavior.
