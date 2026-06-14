## Why

Protocol text validation rejects ASCII control characters and Unicode bidi/zero-width formatting controls in several modules today, but the classifier logic is duplicated. Centralizing the classifier reduces drift risk for security-sensitive metadata such as audit actions, workflow reasons, device display names, capabilities, and JSON detail keys.

## What Changes

- Add one shared protocol helper for ASCII control-character detection.
- Add one shared protocol helper for Unicode bidi/zero-width formatting-control detection.
- Route protocol audit, message, authorization, and identity text validation through the shared helpers.
- Preserve existing validation messages and accepted/rejected values.
- Add regression coverage proving representative protected schema paths use the same classifiers.
- Do not add remote access capabilities, permissions, capture, input, relay behavior, installer behavior, startup behavior, services, token behavior, log sinks, or privilege elevation.

## Capabilities

### New Capabilities

- `protocol-text-safety`: shared constraints for rejecting unsafe text-control metadata in protocol-facing schemas.

### Modified Capabilities

- None.

## Impact

- Affected code: `packages/protocol/src`.
- Affected specs: new `openspec/specs/protocol-text-safety/spec.md`.
- API impact: no public API is intended, but the helper module is available inside the protocol package for shared schema use.
- Safety impact: no new remote capability. Existing fail-closed validation remains aligned across audit, authorization, identity, and protocol message metadata.
- Touched areas: auth and logs via shared protocol validation helpers. Does not touch capture, input, relay routing/runtime, installer, startup, services, tokens, or privilege elevation.
