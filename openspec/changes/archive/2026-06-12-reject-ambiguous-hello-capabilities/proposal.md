## Why

`hello.capabilities` is peer presence metadata used by relay and agents to understand development client behavior, but the protocol currently allows blank or duplicate capability hints. Blank and repeated hints are ambiguous metadata and should be rejected before peers treat them as meaningful.

## What Changes

- Add non-blank validation for each `hello.capabilities` entry.
- Reject duplicate `hello.capabilities` entries.
- Preserve the existing per-capability length bound and array size bound.
- Add protocol tests for blank and duplicate capabilities.
- Document that hello capabilities are bounded, unique metadata hints and do not authorize remote actions.
- Safety impact: this touches protocol presence metadata validation only. It does not add capture, input, clipboard, file transfer, installer, startup, service, credential access, token disclosure, privilege elevation, or hidden access.

## Capabilities

### New Capabilities

### Modified Capabilities
- `session-broker`: Protocol message validation rejects blank or duplicate hello capability metadata before accepting or forwarding messages.

## Impact

- `packages/protocol`: hello capability schema validation and tests.
- `docs`: security model clarification for hello capability metadata.
- OpenSpec: modified message schema validation requirement.
