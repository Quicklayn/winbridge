## Why

Development relay rate-limit environment values control abuse-protection thresholds for invalid tokens and malformed messages. Accepting leading-zero values such as `05` or `060000` makes configuration visually ambiguous and inconsistent with other exact relay numeric settings.

## What Changes

- Require development rate-limit environment values to be canonical positive decimal integers with no leading zeros.
- Preserve omitted defaults for invalid-token and invalid-message rate limits.
- Preserve existing minimum bounds: limits must be at least `1`, and windows must be at least `1000` milliseconds.
- **BREAKING**: development configurations that use leading-zero rate-limit values such as `05` or `060000` will be rejected.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-abuse-protection`: development limiter environment configuration must reject non-canonical integer values before constructing limiters.

## Impact

- Affected code: `apps/relay/src/rate-limit.ts` and `apps/relay/src/rate-limit.test.ts`.
- Affected docs/specs: relay abuse-protection OpenSpec, README, architecture, and security model docs.
- Safety impact: touches relay startup abuse-protection configuration only. It does not add or change screen capture, remote input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, token handling semantics, production authentication, or authorization semantics.
