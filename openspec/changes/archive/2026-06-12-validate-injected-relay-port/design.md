## Context

The relay exposes two port configuration surfaces:

- CLI/environment: `createRelayPortConfig(process.env)` parses `WINBRIDGE_RELAY_PORT`.
- Managed runtime: `createRelayRuntime({ port })` is used by tests and programmatic callers.

The environment path already rejects malformed, partial, negative, fractional, and out-of-range values before runtime startup. The direct runtime path should enforce the same numeric safety boundary so invalid values never reach `server.listen`.

## Goals / Non-Goals

**Goals:**

- Reject unsafe injected port values during `createRelayRuntime`.
- Preserve `0` for ephemeral local test ports.
- Preserve valid TCP port values from 0 through 65535.
- Keep peer-facing behavior unchanged because rejection happens before any listener or peer connection exists.

**Non-Goals:**

- No production relay deployment design.
- No changes to bind address, TLS, NAT traversal, WebRTC, reconnect, identity, auth, pairing, relay tokens, audit content, or rate limiting.
- No new remote assistance capability.

## Decisions

1. Validate injected port values with a runtime guard in `createRelayRuntime`.
   - Rationale: fail-fast behavior is easier to test and avoids depending on Node's later `listen` error shape.

2. Keep environment parsing exact-string based.
   - Rationale: environment values need additional partial-string checks such as rejecting `8787abc` and `001`, while injected options are already numeric values at the TypeScript boundary.

3. Use a generic local error message.
   - Rationale: the error is local startup configuration feedback; it must not expose tokens, pairing codes, protocol payloads, or peer data.

## Risks / Trade-offs

- Programmatic callers that accidentally pass fractional or out-of-range ports now fail during runtime construction instead of later at listener startup. This is intended and aligns with the existing spec.

## Migration Plan

Use exact integer TCP ports from 0 through 65535 when calling `createRelayRuntime({ port })`.

## Open Questions

None.
