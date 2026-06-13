## Why

Signal payload validation already rejects many credential-like key names, but `passphrase` is a common secret marker that should be blocked explicitly. Closing this gap reduces the chance that development signaling metadata can carry credentials while keeping the product inside consent-first remote assistance boundaries.

## What Changes

- Reject `signal.payload` objects with keys containing `passphrase` at any nesting level.
- Cover both parsing and encoding paths with protocol tests.
- Document the passphrase marker in the existing signal payload safety requirement.
- No runtime remote-control capability is added.
- No capture, input, clipboard, file-transfer, diagnostics collection, installer, startup, service, token storage, logging sink, authentication, relay routing, or privilege behavior is added or broadened.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-broker`: expand the existing signal payload safety requirement to treat passphrase-bearing key names as sensitive credential metadata that must be rejected before forwarding or encoding.

## Impact

- `packages/protocol/src/messages.ts`: signal payload sensitive-key marker list.
- `packages/protocol/src/messages.test.ts`: parse/encode rejection tests for passphrase-bearing signal keys.
- `openspec/specs/session-broker/spec.md`: archived requirement update after completion.
