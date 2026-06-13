## Why

The development relay rate limiter is an abuse-control boundary for invalid shared-token attempts and malformed relay messages. It validates direct `SlidingWindowRateLimiter` options in the constructor, but currently keeps the caller-owned options object. Caller mutation after validation can change the effective limit or window without passing through the bounds checks.

Freezing a validated internal snapshot keeps rate-limit behavior tied to safe values and aligns this boundary with the relay heartbeat and pairing configuration snapshots.

## What Changes

- Copy and freeze validated direct rate-limiter options inside `SlidingWindowRateLimiter`.
- Ensure caller mutations after construction cannot change `limit`, `windowMs`, `remaining`, or `resetAt` behavior.
- Add focused tests for post-construction mutation resistance.
- Preserve existing environment parsing, defaults, bounds, reset behavior, and audit metadata.
- Non-goals: no distributed production abuse protection, account throttling, capture, input, clipboard, file-transfer, diagnostics, installer, startup, service, credential, privilege, or consent/authorization semantic changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `relay-abuse-protection`: direct development rate-limiter options are copied into a validated immutable snapshot before use.

## Impact

- Affected code: `apps/relay/src/rate-limit.ts` and focused rate-limit tests.
- Affected systems: local development relay invalid-token and invalid-message throttling for programmatic callers and tests.
- Safety impact: prevents post-validation mutation from weakening or destabilizing abuse controls.
- Security review: required because this touches relay abuse protection.
