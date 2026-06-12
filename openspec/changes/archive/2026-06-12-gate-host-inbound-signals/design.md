## Context

`apps/agent-shell` already redacts inbound signal payloads and rejects misaddressed/self-origin signals. The prior viewer-side gate prevents the stock viewer runtime from sending signals before active visible authorization, but the development relay still forwards schema-valid `signal` messages from a registered viewer because it does not own session authorization state.

The host runtime is the last local boundary before future host UI, capture, and input adapters would consume inbound transport messages. It should ignore viewer signals until the host has locally emitted an active visible authorization state.

## Goals / Non-Goals

**Goals:**

- Track host-emitted authorization lifecycle state inside `AgentShellSessionState`.
- Ignore inbound `signal` messages on the host unless the tracked state is active, visible, unexpired, and grants `screen:view`.
- Fail closed when active visibility is withheld, authorization is paused, `screen:view` is revoked, authorization is terminated, or authorization expires.
- Keep ignored-signal diagnostics secret-safe and avoid local `received` events for blocked signals.

**Non-Goals:**

- Do not add production authorization to the development relay.
- Do not add screen capture, remote input, clipboard, file transfer, WebRTC, native Windows UI, services, startup persistence, or installer behavior.
- Do not change protocol message schemas.

## Decisions

1. **Use host-local workflow state, not relay state, for the inbound gate.**
   - The relay has no authorization lifecycle memory and should remain a development broker.
   - The host runtime already knows when it emits active, paused, revoked, terminated, or expired state, so it can make a local fail-closed decision before event/log exposure.
   - Alternative considered: make the relay authorize `signal` forwarding. That would require centralized authorization state and is a larger production identity/session design.

2. **Block before local `received` events and received signal logs.**
   - The guard runs after session/routing/self-authority validation and before the existing `received` event/log emission.
   - Ignored input uses the existing redacted raw diagnostic path.

3. **Require `screen:view` for inbound host signals.**
   - Today `signal` is the only transport-like message type and is most closely associated with future screen viewing.
   - Future input, clipboard, and file paths should introduce action-specific messages or send APIs under separate OpenSpec changes.

## Risks / Trade-offs

- [Risk] Some future pre-consent negotiation signals could be blocked by this default.
  Mitigation: future WebRTC or NAT traversal design can introduce a separate pre-consent signaling class with its own explicit safety requirements.
- [Risk] Host-side state is local to the development runtime and not production authorization.
  Mitigation: docs keep the relay/runtime development scope explicit; production authorization remains a future identity/session change.
- [Risk] Ordering between control and state update messages can vary.
  Mitigation: host-local scheduled workflow updates the local snapshot at the same time it emits state/control; pause/revoke/terminate/expire all move the snapshot toward fail-closed behavior.
