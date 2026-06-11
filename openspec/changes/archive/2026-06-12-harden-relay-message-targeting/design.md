## Context

WinBridge currently uses a two-party development relay room with one host and one viewer. Registered-peer authority checks prevent a socket from speaking as another peer, but forwarding still treats the remaining peer list as a best-effort delivery target. If there is no remaining peer, the relay records an accepted forward even though nothing was delivered. If explicit target fields are present, they are not checked against the actual recipient.

## Goals / Non-Goals

**Goals:**

- Require exactly one registered recipient for registered-peer forwarding in the current two-party room model.
- Validate explicit target identifiers against that recipient before forwarding.
- Keep omitted `signal.toPeerId` accepted as broadcast-to-remaining-peer behavior in a two-party room.
- Use bounded secret-safe rejection reasons and metadata-only audit records.
- Cover missing-recipient and misaddressed-target cases with relay integration tests.

**Non-Goals:**

- No multi-viewer routing semantics.
- No production identity, account, token lifecycle, RBAC, or durable presence model.
- No new remote action capability, capture, input, file transfer, clipboard sync, installer, service, persistence, or privilege behavior.

## Decisions

- Compute the remaining peer list once before forwarding, after session and sender authority checks.
- Reject forwarding unless the remaining peer list contains exactly one peer. This matches the current one-host/one-viewer relay contract and avoids accepted no-op messages.
- Validate explicit target fields only where the protocol carries an intended recipient: `signal.toPeerId`, legacy `host-consent-decision.viewerPeerId`, and `session-authorization-decision.viewerPeerId`.
- Treat viewer-originated request messages as implicitly addressed to the remaining host peer and rely on the existing two-party role gate plus recipient presence check.
- Add fixed rejection reasons to the relay safe reason allow-list instead of returning parser details or raw payload content.

## Risks / Trade-offs

- A peer can no longer send messages before the other peer joins. Mitigation: this is safer for remote assistance because sensitive workflow messages should have a concrete consent-bound recipient.
- Future multi-viewer work will need new routing rules. Mitigation: the existing specs already require a future OpenSpec change for multi-viewer semantics.
- Omitted `signal.toPeerId` remains accepted. Mitigation: in the current two-party room this still resolves to the single remaining peer; explicit wrong targets are rejected.
