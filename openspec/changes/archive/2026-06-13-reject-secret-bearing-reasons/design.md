## Context

WinBridge already redacts private reason text from local events and audit details, and audit records redact top-level reasons that contain obvious secrets. Authorization lifecycle reason fields, protocol reason fields, and agent-shell workflow reason options currently validate length, trimming, ASCII control characters, and Unicode format controls, but they do not fail closed on secret-bearing text before state or protocol acceptance.

## Goals / Non-Goals

**Goals:**

- Reuse the shared secret-bearing metadata detector already maintained by the audit layer.
- Reject raw token, credential, password, passphrase, pairing-code, API-key, authorization-header, cookie, private-key, SSH-key, keystroke, screenshot, screen-content, clipboard, file-transfer, diagnostics, or secret markers when they appear with values in lifecycle reason text.
- Keep rejection diagnostics bounded and free of raw reason content.
- Preserve existing safe lifecycle reason examples and optional reason defaults.

**Non-Goals:**

- No new reason transport, audit storage, identity, capture, input, diagnostics, or remote-control capability.
- No attempt to classify every possible natural-language secret; this is a defense-in-depth marker/value guard.
- No broad blacklist for ordinary non-secret operational phrases.

## Decisions

1. Reuse `hasSecretBearingAuditMetadata(reason, { includeKeyAssignments: false })`.
   - Rationale: the existing detector already covers sensitive marker/value patterns and remote-assistance content markers. Disabling key-assignment detection avoids rejecting harmless phrases such as `reason: host denied` while still rejecting `token raw-value` and `Authorization: Bearer ...`.
   - Alternative considered: duplicate a protocol-specific regex set. Rejected because duplicate secret detectors drift.

2. Apply the guard at schema/runtime input boundaries.
   - Rationale: authorization state, protocol envelopes, CLI args, and direct runtime options are the boundaries where a reason becomes trusted data or can lead to a workflow message.
   - Alternative considered: only redact reason text later. Rejected because accepted state/protocol data should not carry obvious raw secrets.

3. Keep errors generic.
   - Rationale: rejection itself must not leak raw reason text into thrown errors, usage output, logs, or test diagnostics.

## Risks / Trade-offs

- Some operational reason phrases containing sensitive markers plus values may be rejected -> Mitigated by using concise non-secret reason text such as `Host denied` or `Host revoked screen`.
- The detector is heuristic -> Mitigated by retaining existing redaction layers and by testing representative secret families.
- Future detector changes could alter accepted reason phrases -> Mitigated by focused regression tests for safe reasons and secret-bearing examples.

## Migration Plan

No data migration is required. Existing development workflows should use non-secret lifecycle reason text; any rejected secret-bearing reason should be replaced with bounded non-secret text.

## Open Questions

None.
