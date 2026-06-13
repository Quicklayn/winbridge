## Context

The agent shell keeps a viewer-side authorization snapshot that is updated from host-authority lifecycle messages. Existing guards bind updates to the observed host and matching authorization id, and revoke controls remove permissions locally. However, after a partial revoke leaves other permissions in place, the authorization remains non-terminal, so a later same-authorization state or repeated same-authorization decision can overwrite the snapshot permissions with an older permission set.

## Goals / Non-Goals

**Goals:**

- Preserve viewer-observed same-authorization permission revocations across later lifecycle state and repeated same-id decision updates.
- Keep the viewer fail-closed for `signal` sends when `screen:view` was revoked, even if a stale active state still lists `screen:view`.
- Preserve existing behavior that same-authority revoke confirmations can be received as secret-safe workflow metadata.
- Keep the change local to agent-shell runtime authorization state and integration tests.

**Non-Goals:**

- No new protocol message types, relay behavior, or persistence model.
- No screen capture, input execution, clipboard access, file transfer, diagnostics collection, reconnect behavior, installer/startup/service changes, token handling changes, privilege elevation, hidden sessions, or consent bypass.
- No attempt to infer global ordering for host lifecycle messages beyond local fail-closed revocation memory for the active authorization id.

## Decisions

1. Store a per-snapshot `revokedPermissions` list in `RuntimeAuthorizationSnapshot`.

   Rationale: the runtime needs to remember a safety floor for the current authorization id even when other permissions remain active. Keeping the data inside the existing snapshot resets the floor naturally when a new authorization decision creates a new snapshot.

   Alternative considered: add a separate session-level map keyed by authorization id. That is unnecessary for the current single active viewer authorization model and would require extra cleanup paths.

2. Apply the revoked-permission floor when processing same-id `session-authorization-decision` and `session-authorization-state`.

   Rationale: same-authority lifecycle messages remain receivable, but their permissions are filtered through what the viewer has already observed as revoked for that authorization. This preserves event visibility without restoring sensitive capability.

   Alternative considered: reject any state that contains a revoked permission. That is stricter but would hide potentially useful lifecycle metadata such as pause or termination after a stale permission list.

3. Continue deriving `revoked` status when the filtered permission set becomes empty.

   Rationale: this matches the existing behavior of `removeViewerAuthorizationPermission` and keeps signal authorization fail-closed when the last permission is removed.

   Alternative considered: keep the host-provided status even with an empty filtered permission set. That could preserve stale active status and make diagnostics less clear, even though signal sends would still be blocked by missing `screen:view`.

## Risks / Trade-offs

- Risk: a host bug that accidentally re-sends a revoked permission in later state will be masked locally.
  Mitigation: integration tests assert the local fail-closed result, and future audit/log persistence can surface host-side inconsistency without restoring access.
- Risk: the local revocation floor is per runtime instance and not persisted.
  Mitigation: the current agent-shell runtime is non-native test/CLI infrastructure; persistence is out of scope and future native/session persistence changes must go through OpenSpec.
- Risk: adding internal snapshot metadata could leak into runtime events.
  Mitigation: snapshot metadata remains internal and tests assert existing redacted events, not the internal field.
