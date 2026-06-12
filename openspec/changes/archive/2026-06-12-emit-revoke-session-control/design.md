## Context

`session-control` now carries an `authorizationId` and supports `revoke-permission`, but host revoke simulation still sends only `permission-revoked`, an authorization state update, and an audit event. That is enough to update current shell state, but it leaves the control channel inconsistent with pause, resume, and terminate, and weakens the future adapter contract for immediate host revocation.

## Goals / Non-Goals

**Goals:**

- Emit a bound revoke-permission `session-control` from host revoke simulation after audit persistence succeeds and before revocation state messages.
- Preserve existing `permission-revoked`, state update, and audit-event messages for compatibility with current tests and specs.
- Prove viewer signal sends fail closed after receiving the revoke control.
- Keep reason text redacted in local sent/received events and logs.

**Non-Goals:**

- No native Windows capture, input, clipboard, file transfer, installer, service, startup, persistence, privilege elevation, hidden session, or Windows prompt behavior.
- No relay behavior changes.
- No new permission model or production identity model.

## Decisions

- Send `session-control(action: "revoke-permission")` before `permission-revoked`.
  - Rationale: a control intent should be visible before the resulting revocation notification and state update, and current viewer runtime already treats bound revoke controls as fail-closed state changes.
- Keep `permission-revoked` as the explicit revocation notification.
  - Rationale: existing protocol consumers and audit tests rely on the named revocation message; this change strengthens ordering instead of replacing a message.
- Reuse the same authorization id, actor peer id, permission, and reason across control and revocation messages.
  - Rationale: the messages represent one host action and should be correlated without relying on raw reason text.
- Accept the same-authority `permission-revoked` notification after a bound revoke control has already removed the final viewer permission locally.
  - Rationale: the revoke control should make the viewer fail closed immediately, while the follow-up notification remains an auditable confirmation and must not be dropped as untrusted simply because the viewer is already revoked.

## Risks / Trade-offs

- [Risk] Existing consumers may observe one additional lifecycle message during revoke simulation.
  - Mitigation: repository consumers are tests and docs at this stage; the extra message is schema-valid, host-originated, authorization-bound, and fail-closed.
- [Risk] Revoke control and permission-revoked duplicate the permission removal effect.
  - Mitigation: viewer mutation is idempotent for removing an already-removed permission, and state update remains authoritative for the final status.
