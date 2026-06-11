## Why

The development relay supports an optional shared token, but an explicitly configured empty or whitespace-only token currently behaves like no token. That can accidentally disable the local shared-token gate while looking configured.

## What Changes

- Add shared-token configuration validation for the relay runtime and CLI entrypoint.
- Treat an omitted shared token as the existing documented development mode.
- Reject empty or whitespace-only configured shared tokens before accepting connections.
- Preserve raw non-blank token values and continue to keep token values out of audit/log output.
- Non-goals: no production authentication, no token rotation, no account identity, no MFA, no TLS/certificate policy.

## Capabilities

### New Capabilities

### Modified Capabilities
- `session-broker`: Development relay token configuration rejects blank configured shared tokens before session joins are possible.

## Impact

- Affected code: `apps/relay/src/server.ts`, `apps/relay/src/index.ts`, relay integration tests, docs, and OpenSpec artifacts.
- Safety impact: auth/relay hardening that prevents accidental fail-open token configuration. Does not add remote capabilities or relax consent, visibility, revocation, authorization, or audit requirements.
