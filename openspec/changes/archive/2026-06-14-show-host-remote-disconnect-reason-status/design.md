## Context

The runtime already records `remoteDisconnectReasonCode` from trusted relay-originated `peer-disconnected` notices after the peer identity has been observed and validated. Viewer status exposes this bounded reason code when the trusted host disconnects, while host status currently only exposes `inactiveCause=peer-disconnected` after the viewer disconnects.

## Goals / Non-Goals

**Goals:**

- Expose the relay-defined remote disconnect reason code in host status snapshots after trusted remote viewer disconnect.
- Render the bounded reason code in the existing host status line format for direct status reads, host control prompt status, and scheduled host status print.
- Keep local disconnect, socket close, runtime stop, and terminal authorization inactive status free of stale or unrelated remote disconnect reason metadata.
- Preserve read-only status behavior and existing fail-closed peer-disconnect gates.

**Non-Goals:**

- No new disconnect protocol semantics, reconnect behavior, relay routing, or heartbeat policy.
- No new capture, input, clipboard, file-transfer, diagnostics, unattended access, installer, startup, service, privilege, native Windows, or production identity capability.
- No raw close reason, peer id, display name, private reason, token, pairing code, payload, or remote content in host status output.

## Decisions

- Reuse `sessionState.remoteDisconnectReasonCode` for host status.
  - Rationale: the value is already recorded only after an accepted `peer-disconnected` message and is limited to relay-defined reason codes.
  - Alternative considered: store a separate host-only reason field. That would duplicate state and increase stale-metadata risk.
- Emit the reason only when `hostIndicator.cause === "peer-disconnected"`.
  - Rationale: the same connection-scoped state can exist after local host disconnect notices sent to the viewer; host status should not attach remote reason metadata to local cleanup.
  - Alternative considered: emit whenever `remotePeerDisconnected` is true. That is broader than the visible host indicator cause and could confuse local disconnect status.
- Keep formatting in the existing key/value host status line.
  - Rationale: host status/control status already use compact bounded metadata; adding one optional key is consistent.

## Risks / Trade-offs

- A status line can expose more lifecycle metadata. Mitigation: `remoteDisconnectReasonCode` is relay-defined bounded metadata and not peer identity, raw close reason, private reason, token, payload, or remote content.
- Stale reason codes could confuse local disconnect/status paths. Mitigation: implementation and tests gate the field on `inactiveCause=peer-disconnected` only.
