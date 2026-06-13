## Context

`hello` messages announce peer presence and capability hints. WinBridge treats those hints as metadata only: they do not grant authorization, activate visibility, or enable remote actions. Still, accepted capability strings can appear in protocol messages, local events, and test/debug surfaces. Existing validation rejects blank, untrimmed, and duplicate capability entries but not invisible control or directional formatting characters.

## Goals / Non-Goals

**Goals:**

- Reject ASCII control characters in `hello.capabilities` entries.
- Reject Unicode bidi and zero-width formatting controls, including `U+FEFF`, in `hello.capabilities` entries.
- Keep rejection fail-closed before relay forwarding, agent-shell trusted received/sent events, and public socket writes.
- Keep diagnostics bounded and free of raw capability values.
- Preserve existing generated safe capabilities.

**Non-Goals:**

- No capability negotiation semantics or new remote feature enablement.
- No changes to screen capture, input, clipboard, file transfer, installer, startup, services, or production auth.
- No normalization or repair of malformed capability values.

## Decisions

- Add the same unsafe-character checks used by protocol reason/action metadata to `ProtocolCapabilitySchema`.
  - Rationale: capability strings are protocol metadata and should follow the same visible, unambiguous profile.

- Extend existing malformed capability tests instead of adding a separate validation path.
  - Rationale: relay and agent shell already rely on shared protocol parsing; keeping a single validation boundary reduces drift.

## Risks / Trade-offs

- [Risk] Local experiments may have used arbitrary capability labels with control/formatting characters. -> Mitigation: fail closed because capability metadata must be unambiguous.
- [Risk] Broader capability grammar remains permissive. -> Mitigation: this increment only removes invisible/ambiguous characters; a future change can define a stricter capability token grammar if product negotiation needs it.
- [Risk] This touches relay and agent-shell metadata paths. -> Mitigation: run focused protocol, relay, and agent-shell tests, full gates, strict OpenSpec validation, and security review before archive.
