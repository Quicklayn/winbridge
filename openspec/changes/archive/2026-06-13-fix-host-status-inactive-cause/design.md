## Context

Host runtime indicator events are the host-visible source of truth for whether the session is active, paused, or inactive. The current `getHostStatus()` implementation derives state from the last host authorization snapshot, so after an inactive indicator caused by viewer disconnect or local disconnect, status can still report active authorization metadata as if the host-visible session remained active.

The host status command is a development UI wiring surface. It should reflect the host-visible indicator state and expose only bounded lifecycle metadata.

## Goals / Non-Goals

**Goals:**

- Make host status prefer the last inactive host indicator over the last authorization snapshot.
- Add optional bounded `inactiveCause` metadata when host status is inactive because the local indicator was deactivated.
- Print `inactiveCause` in host control prompt status output when present.
- Preserve read-only status behavior and secret-safe output.

**Non-Goals:**

- No new host controls, reconnect behavior, authorization transitions, audit writes, protocol messages, capture, input, clipboard, file transfer, installer, startup, services, tokens, or privilege behavior.
- No exposure of peer ids, display names, raw WebSocket close reason text, private lifecycle reasons, tokens, pairing codes, signal payloads, or raw protocol data.

## Decisions

- Treat inactive `sessionState.hostIndicator` as authoritative for host status.
  - Rationale: the indicator is the local host-visible session surface; once it is inactive, status must not reconstruct active visibility from stale authorization data.
  - Alternative considered: mutate the authorization snapshot on peer disconnect. Rejected because remote disconnect is connection state, not an authorization lifecycle transition, and should not rewrite authorization history.
- Expose only `inactiveCause`, not all indicator causes.
  - Rationale: the safety bug is stale active-looking status after deactivation. Active and paused status already expose enough local lifecycle metadata.
  - Alternative considered: always expose the last indicator cause. Rejected to keep the status line smaller and avoid implying extra semantics for normal active/paused states.
- Reuse the existing `AgentShellHostIndicatorEvent["cause"]` union.
  - Rationale: it is already bounded, local, and secret-safe.
  - Alternative considered: add free-form reason text. Rejected because raw lifecycle or close reasons can contain private operator text.

## Risks / Trade-offs

- Bounded inactive cause could be mistaken for authorization state -> Mitigation: specs and docs state it is local indicator metadata only and cannot authorize, grant permissions, reconnect, start signaling, or invoke controls.
- Existing exact tests need updates for terminal inactive status -> Mitigation: focused integration tests will assert the new `inactiveCause` while preserving `visibleToHost=false` and `permissionCount=0`.
