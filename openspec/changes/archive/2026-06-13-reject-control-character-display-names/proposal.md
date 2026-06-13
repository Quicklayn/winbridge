## Why

Display names are user-visible peer metadata used in local prompts, logs, and protocol events, but the current contract only rejects blank or untrimmed values. Rejecting ASCII control characters closes avoidable terminal/control-sequence ambiguity before display-name metadata reaches consent workflow surfaces.

## What Changes

- Require protocol device identity display names to be non-blank, already trimmed, 120 characters or less, and free of ASCII control characters.
- Apply the same display-name contract to `hello` metadata, legacy consent request display names, agent-shell `--name`, direct runtime options, inbound `hello`, and public-send `hello`.
- Keep display-name rejection diagnostics secret-safe and non-authorizing.
- Non-goals: no screen capture, input, clipboard, file transfer, installer/service/startup behavior, privilege elevation, production identity, or hidden session capability.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `identity-pairing`: Strengthen local device identity display-name validation.
- `session-broker`: Strengthen shared `hello` display-name validation before relay/agent forwarding or trusted handling.
- `session-authorization-protocol`: Strengthen legacy consent request display-name validation.
- `agent-shell-consent-workflow`: Strengthen agent-shell CLI, runtime, inbound, and public-send display-name rejection.

## Impact

- Affected areas: `packages/protocol`, `apps/agent-shell`, tests, README, security model, and OpenSpec specs.
- Touches user-visible workflow metadata and protocol validation. It does not touch capture, input, relay token semantics, audit persistence, installer behavior, services, startup persistence, privilege elevation, or Windows security prompts.
