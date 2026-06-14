## Why

Protocol immutable snapshot creation is duplicated across audit, authorization, identity, messages, and session grant modules. Centralizing the recursive freeze helper reduces drift risk for trusted audit evidence, authorization state, pairing records, protocol envelopes, and consent-bound grants.

## What Changes

- Add one shared protocol helper for recursive immutable snapshot creation.
- Route protocol audit records, authorization records, identity/pairing records, protocol envelopes, and consent-bound grants through the shared helper.
- Preserve existing JSON-compatible output shapes, schema validation behavior, object freezing behavior, and TypeScript types.
- Add focused regression coverage for representative immutable snapshot paths.
- Do not add remote access capabilities, permissions, capture, input, relay behavior, installer behavior, startup behavior, services, token behavior, log sinks, or privilege elevation.

## Capabilities

### New Capabilities

- `protocol-immutable-snapshots`: shared constraints for returning immutable validated protocol snapshots.

### Modified Capabilities

- None.

## Impact

- Affected code: `packages/protocol/src`.
- Affected specs: new `openspec/specs/protocol-immutable-snapshots/spec.md`.
- API impact: no public package-barrel export is intended; helper use remains internal to protocol implementation.
- Safety impact: no new remote capability. Existing fail-closed immutable snapshot behavior remains aligned across protocol modules.
- Touched areas: auth and logs through immutable protocol data helpers. Does not touch capture, input, relay routing/runtime, installer, startup, services, tokens, or privilege elevation.
