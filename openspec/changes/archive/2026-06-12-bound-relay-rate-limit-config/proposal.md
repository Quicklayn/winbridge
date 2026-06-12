## Why

Development relay rate-limit environment values are canonical positive integers, but they do not have upper bounds. Oversized windows can create invalid reset timestamps at consumption time, while oversized limits can accidentally turn abuse protection into an effectively unbounded limiter.

## What Changes

- Add explicit safe development upper bounds for relay rate-limit limits and windows.
- Reject configured rate-limit limits above `1_000_000`.
- Reject configured rate-limit windows above `2_147_483_647` milliseconds.
- Keep existing defaults and minimums: limits are at least `1`, windows are at least `1000` milliseconds.
- Document the bounded ranges for development relay rate-limit environment variables.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-abuse-protection`: rate-limit configuration must remain canonical and within explicit safe development bounds.

## Impact

- Affected code: `apps/relay/src/rate-limit.ts` and focused relay rate-limit tests.
- Affected docs/specs: relay abuse protection OpenSpec, README, and security model documentation.
- Security impact: touches relay abuse-protection configuration and token/malformed-message rejection paths. It tightens fail-closed startup validation and does not change peer-facing token or payload handling.
- Non-goals: no production distributed limiter, no relay protocol change, no auth token format change, no audit payload expansion, no capture/input/native Windows work, no installer/startup/service behavior, no privilege elevation, and no hidden session behavior.
