## Context

The agent shell is a non-native protocol exerciser for consent and session lifecycle behavior. The relay already rejects viewer-originated host authority messages, but the viewer runtime should still fail closed locally if it receives an authorization state, revocation, or session-control message that cannot be tied to the host authority that approved the local viewer.

## Goals / Non-Goals

**Goals:**

- Bind viewer authorization state to a host decision addressed to the local viewer.
- Require subsequent viewer-side authorization lifecycle messages that affect signal-send authorization to match the same authorization id and host authority where applicable.
- Ignore unbound lifecycle messages before local `received` event emission and workflow state updates.
- Keep ignored-message diagnostics metadata-only.

**Non-Goals:**

- No protocol schema changes.
- No relay behavior changes.
- No production identity model.
- No screen capture, input injection, clipboard sync, file transfer, installer, startup, service, persistence, privilege elevation, hidden session, or Windows prompt behavior.

## Decisions

- Store the viewer's bound host authority in the runtime authorization snapshot after receiving a `session-authorization-decision` whose `viewerPeerId` matches the local viewer.
  - Rationale: the decision message is the existing lifecycle message that names both the host and viewer, so it is the right anchor without adding protocol fields.
  - Alternative considered: trust any active `session-authorization-state` from the relay. Rejected because it leaves the local runtime dependent on a single unbound lifecycle message for send authorization.
- Ignore `session-authorization-state` and `permission-revoked` unless their `authorizationId` and `actorPeerId` match the bound viewer snapshot.
  - Rationale: state and revocation directly affect whether a viewer can send `signal`.
- Ignore `session-control` unless its `actorPeerId` matches the bound host authority.
  - Rationale: `session-control` has no authorization id in the current schema, so actor authority is the available fail-closed binding.
- Continue using the existing ignored unsafe protocol path.
  - Rationale: it already emits redacted raw events and logs only safe byte-length diagnostics.

## Risks / Trade-offs

- [Risk] A future protocol flow might introduce state-before-decision semantics.
  - Mitigation: keep this scoped to the current two-party development shell and require a future OpenSpec change for new lifecycle ordering.
- [Risk] Session-control cannot be tied to an authorization id with the current schema.
  - Mitigation: require the actor to match the bound host authority and leave schema changes out of this increment.
