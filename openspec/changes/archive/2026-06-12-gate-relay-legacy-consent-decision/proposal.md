## Why

Legacy `host-consent-decision` is grant-bearing host authority data. The agent runtime already blocks public sends for this message, but the relay contract and regression coverage should also make the relay boundary explicit so a registered viewer cannot forward a forged legacy host consent decision as ordinary peer traffic.

## What Changes

- Treat legacy `host-consent-decision` as host-originated authority at the relay boundary.
- Add relay integration coverage proving a registered viewer cannot forward a legacy host consent decision to the host.
- Keep legacy `host-consent-required` as a viewer-originated request message; it remains non-granting and must not be reclassified as host authority.
- Update relay authority specs and security/architecture docs to name the legacy decision boundary.
- Non-goals: no screen capture, input injection, clipboard sync, file transfer, installer, service, startup persistence, credential access, Windows prompt bypass, or native Windows API work.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-broker`: legacy host consent decisions are explicitly host-originated and must be rejected when sent by a registered viewer.
- `relay-runtime`: relay integration coverage must prove viewer-originated legacy host consent decisions are rejected before forwarding.

## Impact

- Affected areas: relay authority checks, relay integration tests, OpenSpec specs, and security/architecture documentation.
- Security impact: touches relay, authorization/consent authority, and rejection audit/log handling.
- API impact: no public API shape change; this hardens and documents existing intended behavior.
- Dependencies: none.
