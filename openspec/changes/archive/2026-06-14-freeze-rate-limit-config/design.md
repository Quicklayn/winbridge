## Context

The relay uses `SlidingWindowRateLimiter` for invalid shared-token and invalid-message accounting. Constructor validation rejects unsafe limits and windows, and environment helpers create bounded defaults or overrides.

Direct callers can still hold and mutate the original options object after the limiter is constructed. Because the limiter stores that object reference, later mutation can alter decision metadata and enforcement behavior after validation.

## Goals / Non-Goals

**Goals:**

- Snapshot validated direct limiter options during construction.
- Prevent caller-owned option mutation from changing future rate-limit decisions.
- Keep the same decision shape, reset behavior, environment parsing, and bounds.

**Non-Goals:**

- No distributed rate limiter.
- No production account, IP reputation, or device trust throttling.
- No capture, input, clipboard, file-transfer, diagnostics, installer, startup, service, credential, token, authorization, logging, or privilege changes.

## Decisions

1. Store a copied frozen options object.

   The constructor will validate local `limit` and `windowMs` values and then store `Object.freeze({ limit, windowMs })`. This severs caller ownership and makes accidental internal mutation fail in development.

2. Keep runtime injection shape unchanged.

   `createRelayRuntime()` already accepts limiter instances, not raw limiter options. This change hardens the limiter implementation itself and preserves all runtime option APIs.

## Risks / Trade-offs

- Callers that expected mutating the original options object to reconfigure an existing limiter will no longer affect the limiter. That is acceptable because runtime abuse controls should require a new validated limiter instance for configuration changes.
