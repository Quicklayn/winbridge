## Context

The development relay creates a host-owned in-memory pairing ticket when the host joins and requires the viewer to consume that ticket before room registration. Environment parsing currently treats an empty TTL value as omitted fallback and injected pairing settings can reach `RoomRegistry` without a relay-specific validation gate.

Pairing remains only an admission prerequisite. It does not grant screen viewing, input control, clipboard access, file transfer, diagnostics, or session authorization.

## Goals / Non-Goals

**Goals:**

- Reject malformed pairing ticket TTL and max-use environment values before the relay opens a listener.
- Reject injected pairing settings that are not bounded integers before pairing ticket creation.
- Preserve omitted environment defaults and the existing host-created ticket flow.
- Keep rejection errors bounded and free of raw pairing codes, tokens, protocol payloads, or other secrets.

**Non-Goals:**

- No production identity, device trust, account binding, or durable pairing storage.
- No reconnect policy or multi-viewer pairing semantics.
- No capture, input, clipboard, file transfer, token/auth, installer, startup, service, or privilege changes.
- No change that makes pairing equivalent to host approval or remote action authorization.

## Decisions

1. Use exact integer parsing for pairing environment values.

   Omitted variables keep documented defaults. Configured values must be exact decimal integers, so empty strings, whitespace, suffixes, signs, fractional values, and padded alternate spellings fail fast. Continuing to accept partial values would make an admission-window setting ambiguous.

2. Bound TTL and max uses at the relay configuration boundary.

   Pairing TTL will be limited to `0..86400000` milliseconds for the development relay. `0` remains supported for tests that need immediate expiration. Max uses remains limited to `1..10`, matching the protocol ticket schema's upper bound while preventing unusable zero-use host tickets at runtime.

3. Validate both environment-derived and injected settings.

   Runtime callers and unit tests can bypass environment parsing through injected `pairing` options or direct `RoomRegistry` construction. A shared normalization path keeps these call paths aligned.

## Risks / Trade-offs

- Local scripts that set blank, partial, or very large pairing TTL values will fail before relay startup. This is intended fail-fast behavior for an admission control.
- A 24-hour development TTL maximum is conservative for local testing but is not production pairing policy. Production identity and pairing require a separate OpenSpec design.
