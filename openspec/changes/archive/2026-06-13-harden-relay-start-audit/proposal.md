## Why

The development relay currently emits the accepted `relay.start.development-mode` audit event before the TCP listener has successfully bound. If startup fails or a caller repeats `start()` on an active runtime, audit history can imply that a relay accepted service when it did not.

## What Changes

- Move development-mode startup warning and accepted audit emission after successful listener bind.
- Reject duplicate active relay `start()` calls before opening another listener attempt, logging another warning, or writing another startup audit event.
- Add integration coverage for failed listener bind and duplicate start paths.
- Update relay architecture/security documentation for the startup audit ordering.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-runtime`: tighten managed runtime lifecycle requirements for startup audit ordering and duplicate active starts.

## Impact

- Touches relay startup/lifecycle, relay logs, and relay audit behavior.
- Does not touch capture, input, installer, startup persistence, services, tokens, authentication, privilege elevation, or Windows prompt handling.
- No production authorization model is added; this remains development relay hardening.
- Safety impact: audit records become more trustworthy because accepted relay-start events are emitted only for a listener that actually started, and repeated starts cannot create misleading accepted startup history.
- Non-goals: no new remote access capability, no hidden session behavior, no persistence, no service installation, no credential handling, and no changes to peer protocol semantics.
