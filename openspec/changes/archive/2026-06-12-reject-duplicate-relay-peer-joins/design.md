## Context

The relay room registry stores live peers by `peerId`. The current join flow rejects a second peer with the same role only when the peer id differs, but a second socket using the same `peerId` and role can pass validation and replace the existing peer entry. For a host duplicate join, the same path can also recreate the host pairing ticket before the existing host disconnects.

The development relay is not production identity, but it is the current boundary for exercising consent and pairing. A live peer id must be exclusive until the original socket leaves through normal disconnect cleanup.

## Goals / Non-Goals

**Goals:**

- Reject duplicate live peer-id joins before any room membership or pairing-ticket mutation.
- Keep the existing registered peer and send path intact after a rejected duplicate join.
- Keep rejection diagnostics bounded and secret-safe.
- Preserve normal reconnect after disconnect cleanup removes the prior peer.

**Non-Goals:**

- Production reconnect/resume semantics or account-backed identity.
- Multi-viewer rooms or peer replacement protocols.
- Changes to authorization grants, screen capture, input, clipboard, file transfer, installers, services, startup persistence, or privilege elevation.

## Decisions

- Check duplicate peer id at the start of `RoomRegistry.join()`.
  - Rationale: this is the earliest point with authoritative room state and occurs before host ticket creation or viewer ticket consumption.
  - Alternative considered: detect duplicate peer id in the WebSocket runtime before calling the registry. That would duplicate room ownership logic and still need a registry guard for tests and future callers.

- Use a static bounded rejection reason.
  - Rationale: peer-facing relay errors and audit reasons should not include session ids, peer ids, pairing codes, or raw payload data.
  - Alternative considered: reuse the current role-occupied message. It includes session id text and does not specifically document same-peer replacement denial.

- Preserve normal post-disconnect rejoin.
  - Rationale: this change blocks live duplicate identity replacement, not legitimate development reconnect after `leave()` has removed the old peer.
  - Alternative considered: ban peer-id reuse for the lifetime of a room. That would be stricter but would conflict with simple development workflows and is a separate reconnect-policy decision.

## Risks / Trade-offs

- A client that opens a replacement socket before the old socket closes will be rejected.
  - Mitigation: clients must close the old socket or wait for relay disconnect cleanup before rejoining with the same peer id.

- This does not authenticate peer identity.
  - Mitigation: docs continue to state that production identity, device trust, and reconnect semantics require future OpenSpec work.
