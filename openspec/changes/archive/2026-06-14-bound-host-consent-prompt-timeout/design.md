# Design: Direct host consent timeout bounds

## Overview
The interactive host consent prompt is a development approval boundary. The prompt helper should fail before rendering host-facing prompt text or creating timers when called directly with malformed timeout values.

## Approach
- Reuse the agent-shell scheduler delay bounds module and add a positive-delay assertion.
- Validate direct prompt `timeoutMs` values when an interactive host decision provider is created and when the prompt helper is called directly.
- Require `timeoutMs` to be an integer from `1` through `2_147_483_647` when supplied.
- Keep omitted `timeoutMs` using the existing default timeout.
- Keep valid positive timeouts and answer parsing unchanged.
- Throw a bounded generic error for invalid direct timeout configuration and do not echo raw timeout values.

## Security Rationale
The host consent prompt must fail closed and remain predictable. Rejecting malformed timeout values before prompt rendering prevents accidental immediate timeout, clamped long waits, or other coercion artifacts while preserving host consent, visible-session, authorization, and audit boundaries.

## Compatibility
CLI users should see no behavior change because CLI parsing already rejects malformed host consent timeout values. Direct callers using omitted or valid positive integer timeouts remain compatible. Direct callers using malformed numeric timeouts now receive a bounded error before prompt side effects.

## Alternatives Considered
- Rely only on CLI/runtime validation: rejected because `promptForHostConsentDecision()` and `createInteractiveHostDecisionProvider()` are exported direct APIs.
- Clamp invalid values: rejected because clamping could hide caller bugs and make host consent timing unpredictable.
