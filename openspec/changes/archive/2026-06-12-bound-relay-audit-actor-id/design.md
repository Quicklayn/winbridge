## Context

`AuditActorSchema.id` uses the shared `ProtocolIdentifierSchema`, which is capped at 128 characters. The relay audit helper currently builds actor ids by prefixing peer ids with `development-relay:`. That preserves useful context for normal peer ids but can exceed 128 characters for max-length valid peer ids.

## Goals / Non-Goals

**Goals:**

- Keep relay audit actor ids schema-valid for every valid peer id.
- Preserve existing actor id format for short peer ids.
- Use deterministic bounded metadata for overlong peer ids so repeated events can still be correlated.
- Avoid adding raw token, pairing code, protocol payload, or other sensitive material to audit details.

**Non-Goals:**

- No changes to peer id validation or protocol identifier limits.
- No changes to relay authentication, pairing, routing, or room membership behavior.
- No new remote-control, capture, input, keylogging, clipboard, file transfer, diagnostics, installer, startup, service, persistence, privilege, or native Windows capability.
- No migration of existing audit log records.

## Decisions

- Preserve `development-relay:<peerId>` when it fits the protocol identifier limit.
  - Rationale: this avoids unnecessary changes to existing audit output and tests.
  - Alternative considered: always hash peer ids. That would reduce readability for normal development audit records.

- For overlong prefixed actor ids, use `development-relay:peer:<sha256-prefix>` as the actor id and add full SHA-256 hash plus original peer id length to audit detail.
  - Rationale: the actor id remains short, deterministic, and schema-valid; the full raw peer id is not copied into detail.
  - Alternative considered: truncate the peer id. Truncation can collide and may still expose misleading partial identifiers.

- Add relay integration coverage for a max-length peer id join.
  - Rationale: the unit test covers the helper, while the integration test proves the relay does not drop a real audit event.

## Risks / Trade-offs

- Overlong peer actor ids become hash-based rather than human-readable -> mitigated by deterministic full hash and length metadata.
- Hash metadata can correlate events but not recover the original peer id -> acceptable for bounded, secret-safe audit metadata.
- Existing consumers that expected the full peer id in `actor.id` for overlong ids will see a new bounded id -> such records previously failed schema validation, so this is a compatibility fix for an otherwise broken path.
