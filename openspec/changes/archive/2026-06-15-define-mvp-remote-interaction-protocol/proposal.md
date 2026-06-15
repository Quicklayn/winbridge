## Why

WinBridge needs a concrete protocol layer for the MVP vertical slice where an approved viewer can receive host screen frames and send bounded input events. The existing relay and authorization workflow can connect peers and grant permissions, but remote interaction still lacks explicit wire contracts that can be validated, tested, and later bound to native Windows capture/input adapters.

## What Changes

- Add consent-bound protocol envelopes for host-to-viewer screen frames and viewer-to-host input events.
- Require every remote interaction payload to carry an authorization id and bounded sequencing metadata.
- Keep native Windows capture, input injection, installer, service, startup, unattended access, and privilege elevation out of scope for this change.
- Preserve fail-closed behavior for malformed, oversized, secret-bearing, unknown-field, paused, revoked, terminated, expired, or unapproved remote interaction attempts.

## Capabilities

### New Capabilities

- `mvp-remote-interaction-protocol`: Defines the validated protocol envelopes for MVP screen-frame delivery and pointer/keyboard input events after explicit host authorization.

### Modified Capabilities

- `relay-runtime`: Adds explicit forwarding, targeting, role, and audit requirements for MVP remote interaction envelopes.

## Impact

- Affects `packages/protocol` message schemas, exported TypeScript types, and protocol tests.
- The relay will continue to forward only schema-valid protocol envelopes and will add role/target gates for the new remote interaction envelope types.
- Touches capture and input protocol contracts only. It does not implement native Windows capture, input injection, installer behavior, startup persistence, services, token handling, or privilege elevation.
