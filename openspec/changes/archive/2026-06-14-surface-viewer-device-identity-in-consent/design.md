## Context

The agent runtime already creates a schema-validated local `DeviceIdentity` for `join-session`, and the relay uses that metadata for pairing and audit attribution. After peers are paired, the agent shell exchanges `hello` messages for peer presence and display-name metadata; the host consent prompt then uses the observed viewer `hello` data when asking the host to approve or deny requested permissions.

The gap is that the host prompt does not receive the viewer device id or platform even though those fields already exist and are validated by the shared protocol identity schema. This change keeps identity metadata distinct from production account authentication and from authorization grants. Remote `trustLevel` remains self-asserted in the current bootstrap, so it is not rendered as consent prompt trust context.

## Goals / Non-Goals

**Goals:**

- Add optional `deviceIdentity` to `hello` peer metadata using the existing shared schema.
- Prevent conflicting `hello.displayName` and `hello.deviceIdentity.displayName` values when `deviceIdentity` is present.
- Track trusted opposite-role `hello.deviceIdentity` locally in the agent runtime.
- Provide bounded viewer device id and platform to the interactive host consent provider.
- Avoid displaying self-asserted remote trust levels as host consent context.
- Render missing or unsafe optional device prompt metadata as unavailable without echoing raw values.

**Non-Goals:**

- No production account authentication, durable device trust store, persistence, reconnect, or multi-viewer semantics.
- No relay authorization changes and no new permissions.
- No screen capture, input, clipboard, file transfer, diagnostics dump, hidden session, stealth startup, service install, credential collection, Windows prompt bypass, token lifecycle change, or privilege elevation.

## Decisions

- Reuse `DeviceIdentitySchema` in `HelloMessageSchema`.
  - Rationale: the protocol already has the exact validation boundary for device id, display name, platform, trust level, and creation timestamp. Reusing it avoids a second partial identity schema.
  - Alternative considered: adding separate `deviceId`, `platform`, and `trustLevel` fields to `hello`. That would duplicate validation and make it easier for top-level display text and identity text to diverge.

- Require matching top-level and nested display names.
  - Rationale: host consent UI should not have to choose between two viewer display names. A mismatch is ambiguous identity metadata and should fail closed before forwarding or prompt rendering.
  - Alternative considered: ignoring the nested display name. That leaves conflicting metadata in protocol events and makes future UI wiring less predictable.

- Pass only device id and platform into the host consent provider.
  - Rationale: those fields help the host distinguish the requesting viewer in a bounded way. The nested display name is already represented by `viewerDisplayName`; `createdAt` is not useful enough for the development prompt to justify extra UI surface; `trustLevel` is self-asserted by the remote peer in the current bootstrap and must not be presented as verified trust.
  - Alternative considered: passing the full `DeviceIdentity`. That exposes more fields to prompt code than it needs.
  - Alternative considered: showing `trustLevel` with a self-declared label. Omitting it is stricter and avoids normalizing trust text before authenticated device trust exists.

- Treat prompt device metadata as non-authorizing.
  - Rationale: device identity remains local development metadata. Permission approval still requires the existing explicit host decision and visible authorization workflow.

## Risks / Trade-offs

- Older peers omit `hello.deviceIdentity` -> the prompt renders device metadata as unavailable and keeps the existing consent flow.
- Malicious peers send conflicting or unsafe identity metadata -> protocol parsing rejects it before trusted events, host prompt context, authorization decisions, or workflow audit records.
- Device id appears in host-facing prompt text -> the value is restricted by protocol identifier and secret-bearing metadata validation; unsafe optional direct prompt inputs render as unavailable.
- A peer self-asserts `trustLevel: verified` -> the runtime does not pass trust-level metadata into host consent providers, and the prompt does not render it.
