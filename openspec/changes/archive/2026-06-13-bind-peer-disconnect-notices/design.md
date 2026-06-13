## Context

The non-native agent shell treats `peer-disconnected` as a local fail-closed lifecycle event: public sends stop, delayed host workflow is suppressed, and an active host indicator is deactivated. That behavior is correct for a trusted disconnect notice about the actual remote peer, but the current runtime does not bind the notice to the peer identity learned through the normal opposite-role `hello` presence path.

## Goals / Non-Goals

**Goals:**

- Accept state-changing disconnect notices only for the observed opposite-role peer.
- Ignore unbound, same-role, or mismatched `peer-disconnected` messages before `received` event emission.
- Keep ignored-message diagnostics secret-safe and payload-free.
- Preserve current fail-closed behavior for real relay disconnect notices after peer presence has been observed.

**Non-Goals:**

- Do not add reconnect or retry behavior.
- Do not change relay protocol schemas.
- Do not add capture, input, clipboard, file transfer, diagnostics collection, installer, startup, service, privilege, or Windows-native behavior.
- Do not treat peer-originated disconnect messages as trusted authority.

## Decisions

- Add an inbound guard before local `received` event emission.
  - Rationale: existing unsafe inbound boundaries use guard functions before event/log emission; disconnect binding should follow the same pattern so ignored notices are only surfaced as redacted raw input.
  - Alternative considered: accept all opposite-role disconnect notices. Rejected because a forged notice for an arbitrary opposite-role peer would still be able to suppress workflow before identity binding.

- Bind disconnect notices to `sessionState.observedPeerId` and `sessionState.observedPeerRole`.
  - Rationale: the observed opposite-role `hello` is the runtime's existing peer-presence authority for public sends and host authorization request binding.
  - Alternative considered: infer trust from `relay-ready` room size. Rejected because room size does not identify the concrete remote peer and cannot prove the disconnect notice refers to that peer.

- Preserve existing disconnect effects after the notice passes binding.
  - Rationale: once trusted, disconnect remains fail-closed for delayed workflow and direct sends, and continues to deactivate host visibility indicators.

## Risks / Trade-offs

- Strict binding can ignore a legitimate relay disconnect that arrives before the remote `hello` is observed. This is acceptable for the development shell because no trusted remote peer identity has been established yet; public sends and authorization workflows should not rely on unbound peer lifecycle authority.
- Tests must avoid depending on raw protocol payload text because ignored messages are intentionally reported only with byte-length metadata.
