# Design: Enforce Host Workflow Message Role

## Current Relay Checks

`assertRegisteredPeerCanForward()` already rejects:

- registered `join-session` replay,
- relay-originated message forgery,
- spoofed sender or actor peer ids,
- host/viewer role mismatch for authorization request and decision messages.

For `session-authorization-state`, `permission-revoked`, `session-control`, and `audit-event`, the relay currently checks only `actorPeerId`.

## Proposed Behavior

For the current consent workflow, require the registered peer role to be `host` before forwarding these actor-based workflow messages:

- `session-authorization-state`
- `permission-revoked`
- `session-control`
- `audit-event`

Implementation shape:

```text
case "session-authorization-state":
case "permission-revoked":
case "session-control":
case "audit-event":
  assertEnvelopeRole("host", peer)
  assertEnvelopePeer(envelope.actorPeerId, peer)
```

The existing bounded rejection reason `Message role does not match registered peer` remains sufficient and secret-safe.

## Security Rationale

In the current product scope, these messages are host workflow authority: visible activation, pause/resume/terminate, permission revocation, and host-generated workflow audit simulation. A viewer should not be able to author those messages through the relay, even with its own actor id.

The relay remains a development broker, not production authorization. This hardening keeps role boundaries explicit until a future OpenSpec change defines any delegated-control or multi-party semantics.

## Test Strategy

Add relay integration coverage where a paired viewer sends each host-workflow message with `actorPeerId = viewer-1`. The relay MUST:

- return `Message role does not match registered peer`,
- not forward the message to the host,
- emit a secret-safe rejection audit record,
- avoid storing private reason/detail markers.

