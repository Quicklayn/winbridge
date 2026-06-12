## Context

`apps/agent-shell` is a non-native protocol exerciser. It does not capture screens, inject input, sync clipboard, transfer files, or run as a background service. Its public `send()` method is still the local boundary future callers use for low-level protocol envelopes.

Relay-side authority checks already reject spoofed `signal.fromPeerId` and explicit wrong `signal.toPeerId` targets. The agent shell should enforce the same local identity boundary before writing to a socket or emitting local `sent` events, because tests and future adapters may exercise the runtime against relay-like endpoints or inspect local events as if they were accepted behavior.

## Goals / Non-Goals

**Goals:**

- Require outbound public runtime `signal.fromPeerId` to equal the runtime's local `peerId`.
- Require explicit outbound public runtime `signal.toPeerId` values to equal the authorized remote peer for the active authorization.
- Run the check before authorization checks that may depend on signal state, before socket writes, and before local `sent` event emission.
- Keep thrown errors and diagnostics generic so blocked signal payloads and routing metadata are not exposed.

**Non-Goals:**

- Do not require `signal.toPeerId` to be present; omitted targets remain relay-resolved to the remaining peer in the two-party development room.
- Do not add remote capture, input, clipboard, file transfer, WebRTC, native Windows UI, services, startup persistence, credential access, stealth behavior, or production identity.
- Do not change protocol schemas or relay forwarding rules.

## Decisions

1. **Put the local check in the public runtime send path.**
   - `AgentShellRuntime.send()` already gates workflow-authority messages and authorization-sensitive `signal` sends before `sendProtocol()`.
   - Adding peer binding there prevents socket writes and local `sent` events for spoofed or self-targeted signals.
   - Alternative considered: rely only on relay rejection. Rejected because local managed runtime consumers should see fail-closed behavior even when exercised against a relay-like test endpoint.

2. **Validate local sender and explicit authorized target.**
   - `fromPeerId` must equal `options.peerId`.
   - `toPeerId` may be omitted, matching the existing two-party relay behavior; if present it must match the authorized remote peer from the active authorization snapshot.
   - Host snapshots bind the remote peer from the approved authorization request's `viewerPeerId`.
   - Viewer snapshots bind the remote peer from the host authority in the local-viewer authorization decision and state.
   - Alternative considered: only reject self-targets and rely on the relay for third-peer targets. Rejected because the public runtime send path is a local authorization boundary and should not emit accepted local `sent` events for explicitly wrong targets.

3. **Use a generic blocked signal error.**
   - The existing authorization error is payload-safe but semantically narrow.
   - A dedicated routing error keeps diagnostics bounded and avoids echoing peer ids, signal payload keys, tokens, pairing codes, private reasons, screen contents, or input contents.

## Risks / Trade-offs

- [Risk] Some tests or future adapters may have relied on relay rejection for spoofed signal routing.
  Mitigation: local rejection is stricter and happens before any accepted local event; callers can correct the envelope to use the runtime peer id.
- [Risk] Omitted `toPeerId` still depends on relay two-party recipient resolution.
  Mitigation: this change intentionally preserves existing protocol behavior while blocking local sender spoofing and explicit self-target or third-peer targets.
