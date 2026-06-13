## Why

Display names are user-visible peer metadata used in consent prompts, runtime events, and logs. They already reject blank, untrimmed, oversized, and ASCII-control values, but Unicode bidirectional formatting controls can still make visible text appear reordered or ambiguous. Rejecting those controls keeps peer identity metadata predictable before it reaches host consent or audit surfaces.

## What Changes

- Require protocol device identity display names to be free of Unicode bidirectional formatting controls in addition to the existing canonical display-name rules.
- Apply the same shared display-name contract to `hello` metadata, legacy consent request display names, agent-shell `--name`, direct runtime options, inbound `hello`, and public-send `hello`.
- Keep diagnostics bounded, generic, secret-safe, and non-authorizing.
- Non-goals: no screen capture, input, clipboard, file transfer, installer/service/startup behavior, privilege elevation, production identity, account trust, Unicode script allowlists, or hidden session capability.

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
- Touches user-visible workflow metadata and protocol validation.
- Does not touch capture, input, relay token semantics, audit persistence, installer behavior, services, startup persistence, privilege elevation, Windows security prompts, or transport encryption.
