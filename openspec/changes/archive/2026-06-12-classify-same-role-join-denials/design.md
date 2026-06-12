## Context

`RoomRegistry` already rejects a second live peer with the same role, and relay integration tests prove the original peer remains active. The rejection currently carries a dynamic room-level error from the registry, so `server.ts` maps it to the generic `Invalid relay message` reason for the peer and audit record.

## Goals / Non-Goals

**Goals:**

- Use a bounded relay-defined reason for second-host and second-viewer join denials.
- Preserve the existing two-party room model and fail-before-registration behavior.
- Add audit detail metadata that distinguishes same-role conflicts from duplicate peer-id joins and pairing failures.
- Keep peer-facing and audit metadata free of raw pairing codes, tokens, protocol payloads, private reasons, keystrokes, screenshots, screen contents, or full secrets.

**Non-Goals:**

- No multi-host, multi-viewer, reconnect, or peer replacement semantics.
- No protocol message shape changes.
- No changes to capture, input, clipboard, file transfer, diagnostics collection, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, token matching, authentication grants, or authorization decisions.

## Decisions

1. Define a same-role join denial constant in `rooms.ts`.
   - Rationale: the room registry is the source of relay admission constraints, and exporting the bounded reason keeps `server.ts` from parsing dynamic error strings.
   - Alternative considered: keep dynamic messages and add substring matching in `server.ts`. Rejected because it risks exposing session ids and makes secret-safety depend on string parsing.

2. Add the same-role reason to the relay safe-reason allowlist.
   - Rationale: peer-facing `relay-error` responses may expose only bounded relay-defined metadata. A constant reason is safe to return and useful for operators.
   - Alternative considered: keep peer-facing errors generic but classify only audit details. Rejected because tests and local operators benefit from deterministic bounded diagnostics, and the reason reveals no secrets.

3. Extend join-denial audit detail with `roleConflict`.
   - Rationale: current `duplicatePeer` metadata distinguishes same peer-id collisions but leaves same-role conflicts looking like generic invalid joins. A boolean classification is bounded and secret-safe.
   - Alternative considered: include the conflicting role or existing peer id. Rejected for this increment because the denial reason and message type are enough for audit triage without additional identity metadata.

## Risks / Trade-offs

- [Risk] Existing tests that expect the generic reason will need updates. -> Mitigation: change only same-role join tests and preserve generic handling for unknown dynamic errors.
- [Risk] A new peer-facing reason could be mistaken for authorization. -> Mitigation: the reason is a relay admission denial only; it does not grant permissions, register a peer, activate visibility, or start any remote action.
