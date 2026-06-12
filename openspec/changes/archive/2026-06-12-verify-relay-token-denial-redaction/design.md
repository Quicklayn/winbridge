## Context

The development relay can be configured with a shared token. This is a local/private development guard only; production identity and authorization remain a future, stronger design. When a peer presents an invalid token, the relay rejects the socket before room join and writes a `relay.token.denied` audit record.

The current implementation uses a fixed close reason (`Invalid relay token`) and an audit detail boolean (`accessPresented`) plus safe rate-limit metadata. The regression test should prove those surfaces remain secret-safe even when the wrong token and configured token include unique marker strings.

## Goals / Non-Goals

**Goals:**

- Prove invalid-token WebSocket close reason is bounded and does not contain raw presented or configured token values.
- Prove invalid-token audit records keep safe metadata and do not contain raw token markers.
- Preserve existing token rejection semantics.

**Non-Goals:**

- No production authentication design.
- No new relay authorization mode.
- No changes to pairing, session forwarding, capture, input, clipboard, file transfer, diagnostics, installer, startup, service, or privilege behavior.

## Decisions

1. Extend relay integration coverage instead of adding unit-only checks.
   - Rationale: the risk includes both externally visible WebSocket close reason and persisted audit record content.
   - Alternative considered: unit-test close reason constants, but that would not prove the runtime rejection path.

2. Use unique token marker strings.
   - Rationale: absence checks catch accidental leakage across the whole close/audit surface.

## Risks / Trade-offs

- Test remains coupled to the current safe close reason string. That is acceptable because the string is peer-facing and should be intentionally changed if altered.

## Migration Plan

This is test/spec hardening only. If the test fails, the runtime must redact the token surface before archive.

## Open Questions

None.
