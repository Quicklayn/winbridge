## Context

The relay treats `sharedToken` as optional. When it is absent, the relay starts in documented development mode and warns that this is not production authorization. When `WINBRIDGE_RELAY_SHARED_TOKEN` is present but empty, the current falsy check treats it the same as absent and disables token enforcement.

## Goals / Non-Goals

**Goals:**
- Distinguish omitted token configuration from explicitly blank token configuration.
- Reject blank or whitespace-only shared tokens before opening the relay for peers.
- Keep existing behavior for omitted token and valid non-blank tokens.
- Keep token values out of audit records and logs.

**Non-Goals:**
- No production auth provider, token hashing, token storage, rotation, MFA, or account binding.
- No change to pairing-ticket semantics.
- No change to relay wire protocol.

## Decisions

1. Add `createRelaySharedTokenConfig(env)` in `server.ts`.

   Rationale: the relay entrypoint can use the same tested helper as integration tests. The helper returns `undefined` only when the env variable is absent.

2. Validate runtime options as well as env parsing.

   Rationale: tests and future callers can instantiate `createRelayRuntime({ sharedToken })` directly. The runtime should not allow blank tokens even if a caller bypasses the CLI entrypoint.

3. Preserve raw non-blank token values.

   Rationale: trimming or normalizing secrets can cause surprising mismatches. Only blank/whitespace-only values are rejected.

## Risks / Trade-offs

- Local environments that intentionally set an empty token to mean development mode will now fail. Mitigation: omit `WINBRIDGE_RELAY_SHARED_TOKEN` entirely to use development mode.
