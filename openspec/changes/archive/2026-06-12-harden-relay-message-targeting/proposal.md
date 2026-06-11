## Why

The relay now binds forwarded messages to the registered sender, but it can still accept messages when no peer is available to receive them or when explicit target fields identify someone other than the remaining room peer. Relay forwarding should fail closed instead of accepting no-op or misaddressed remote-assistance messages.

## What Changes

- Require a registered recipient peer before accepting a registered-peer message for forwarding.
- Reject `signal.toPeerId` values that do not match the actual remaining peer in the two-party room.
- Reject host decision messages whose `viewerPeerId` does not match the actual remaining viewer peer.
- Keep relay error and audit reasons bounded and secret-safe.
- Add relay integration tests for missing recipient, misaddressed signaling, and misaddressed authorization decisions.
- No remote capture, input, installer, service, startup, persistence, credential collection, prompt bypass, or privilege capability is added.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: Add registered-recipient and explicit target validation requirements for relay forwarding.
- `relay-runtime`: Add integration-test expectations for recipient/target rejection and secret-safe audit metadata.

## Impact

- Affected code: `apps/relay/src/server.ts`, `apps/relay/src/server.integration.test.ts`.
- Affected docs/specs: `docs/security-model.md`, `docs/architecture.md`, `openspec/specs/session-broker/spec.md`, `openspec/specs/relay-runtime/spec.md`.
- Safety impact: reduces ambiguous routing and prevents the relay from silently accepting messages that cannot be delivered to the consent-bound remote peer.
- Touches: relay forwarding and audit rejection reasons.
- Does not touch: native Windows capture/input, installer/startup/service behavior, credential access, AV/EDR behavior, Windows security prompts, or privilege elevation.
