## Why

Peer display names appear in identity, presence, and consent metadata, but the shared protocol schemas currently allow whitespace-only values. That weakens host consent UX because a viewer or device can arrive with an effectively blank label even though the development CLI already rejects blank display names.

## What Changes

- Add a shared non-blank display-name schema for protocol peer/device metadata.
- Reject whitespace-only `deviceIdentity.displayName`, `hello.displayName`, and legacy `host-consent-required.viewerDisplayName`.
- Keep display-name validation bounded to the existing 1-120 character range.
- Add protocol tests for blank display-name rejection.
- Document that display-name metadata must be meaningful before it is used in peer or consent UI.
- Safety impact: this touches identity and protocol validation only. It does not add capture, input, clipboard, file transfer, installer, startup, service, credential access, token disclosure, privilege elevation, or hidden access.

## Capabilities

### New Capabilities

### Modified Capabilities
- `identity-pairing`: Device identity display names must be non-blank before metadata is used.
- `session-broker`: Protocol message validation rejects blank display-name metadata before accepting or forwarding messages.
- `session-authorization-protocol`: Legacy consent request viewer display names must be non-blank before consent prompts can rely on them.

## Impact

- `packages/protocol`: shared display-name schema and tests for identity/message validation.
- `docs`: security model clarification for display-name metadata.
- OpenSpec: modified requirements in identity pairing, broker validation, and legacy consent message validation.
