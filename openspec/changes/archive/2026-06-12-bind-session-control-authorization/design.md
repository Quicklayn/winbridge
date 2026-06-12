## Context

WinBridge uses `session-authorization-decision`, `session-authorization-state`, `permission-revoked`, and `session-control` messages to exercise a consent-bound lifecycle before any native Windows capture or input adapter exists. State and revocation messages already include `authorizationId`, but `session-control` only identifies the actor and action. That makes pause, resume, terminate, and permission-revoke intent less precise than the authorization state they are meant to control.

## Goals / Non-Goals

**Goals:**

- Require `authorizationId` on all `session-control` protocol messages.
- Emit bound `authorizationId` values from host workflow pause, resume, and terminate simulation.
- Make viewer-side `session-control` handling fail closed unless the control matches the current authorization id and bound host authority.
- Ignore mismatched controls before local `received` event emission and without exposing raw protocol payloads.
- Update tests and docs around the protocol breaking change.

**Non-Goals:**

- No native Windows capture, input, clipboard, file transfer, installer, service, startup, persistence, privilege elevation, hidden session, or Windows prompt behavior.
- No production account identity or durable token lifecycle.
- No relay routing change beyond test fixture updates required by schema validation.

## Decisions

- Add required `authorizationId: ProtocolIdentifierSchema.min(8)` to `SessionControlMessageSchema`.
  - Rationale: every control action changes or requests a change to a specific authorization lifecycle, so the protocol contract should carry that binding instead of relying on connection context alone.
- For viewer inbound lifecycle authority, require `session-control.authorizationId` and `actorPeerId` to match the current non-terminal viewer authorization snapshot.
  - Rationale: actor authority alone is not sufficient when a host could emit stale control for a previous grant in the same development session.
- Keep the existing ignored unsafe inbound protocol path for mismatched controls.
  - Rationale: it emits only redacted raw events and byte-length logs, matching existing secret-safe diagnostics.
- Preserve separate `permission-revoked.authorizationId` behavior.
  - Rationale: this change makes control intent consistent but does not remove the existing revocation state message.

## Risks / Trade-offs

- [Risk] This is a protocol-breaking change for local fixtures and any external development scripts that send `session-control` without an authorization id.
  - Mitigation: the repository is still a bootstrap foundation; update all local senders and document the contract now before native adapters depend on it.
- [Risk] Requiring ids on controls may seem redundant for two-party sessions.
  - Mitigation: explicit ids keep authorization checks robust when reconnect, multiple grants, or native adapters are introduced later.
