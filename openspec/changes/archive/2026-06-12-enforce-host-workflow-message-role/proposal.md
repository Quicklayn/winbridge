# Enforce Host Workflow Message Role

## Why

The relay already rejects spoofed sender/actor peer ids and role-mismatched authorization request/decision messages. Host-side workflow control messages such as authorization state, permission revocation, session control, and development workflow audit events also represent host-originated consent lifecycle authority in the current product scope.

Today the relay checks their `actorPeerId` but does not require the registered peer role to be host. A registered viewer could send a syntactically valid host-workflow message with its own actor id and have it forwarded. That does not implement capture or input, but it weakens the consent workflow boundary.

## What Changes

- Require registered host role before forwarding:
  - `session-authorization-state`
  - `permission-revoked`
  - `session-control`
  - `audit-event`
- Preserve existing actor peer id checks and target recipient checks.
- Add integration tests proving viewer-originated workflow control messages are rejected before forwarding with secret-safe relay errors and audit metadata.
- Update relay/session broker specs and docs.

## Safety Impact

This change touches relay authorization/consent workflow message forwarding. It does not add screen capture, input injection, clipboard sync, file transfer, installer behavior, startup persistence, services, token handling changes, logs beyond existing secret-safe rejection audit, privilege elevation, or native Windows APIs.

The change is fail-closed: messages that imply host lifecycle authority are not forwarded from viewer peers.

## Non-Goals

- No production identity or account authorization.
- No native Windows host UI, capture, input, clipboard, or file-transfer implementation.
- No multi-viewer or delegated-control semantics.
- No changes to protocol schemas.

## Modified Capabilities

- `session-broker`
- `relay-runtime`

