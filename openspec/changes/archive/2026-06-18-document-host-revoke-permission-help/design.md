## Context

The host control prompt already parses `revoke <permission>` and routes accepted
permissions through the managed runtime revoke path. The MVP command kit also
prints all three relevant revoke forms. The remaining gap is discoverability in
the prompt's bounded static help and nearby documentation.

## Goals / Non-Goals

**Goals:**

- Make the host's immediate revocation controls discoverable for `screen:view`,
  `input:pointer`, and `input:keyboard`.
- Keep help output static, bounded, and secret-safe.
- Verify that accepted revoke commands are visible without changing runtime
  authorization, audit, or permission validation behavior.

**Non-Goals:**

- No new permissions or protocol messages.
- No production native host UI.
- No changes to input application, capture, relay, auth, tokens, logs,
  installer, startup, services, or privilege behavior.

## Decisions

- Use explicit command forms in help instead of a generic placeholder only.
  This matches the command kit and makes the host's input revocation path
  directly discoverable during an active session.
- Keep parser and runtime revoke behavior unchanged. Existing validation remains
  the source of truth for rejecting unsupported permissions, clipboard,
  file-transfer, diagnostics-shaped values, malformed commands, and unsafe
  command lines.
- Update docs/spec alongside the prompt so MVP operator guidance stays aligned
  with the implementation.

## Risks / Trade-offs

- [Risk] Longer help text could look noisier in a compact terminal.
  -> Mitigation: keep one bounded static line and only add the two missing MVP
  revoke forms.
- [Risk] Listing input revoke commands could be mistaken for expanding
  permissions.
  -> Mitigation: tests keep parser behavior focused on the existing permission
  allowlist, and the spec states that help does not widen accepted permissions.
