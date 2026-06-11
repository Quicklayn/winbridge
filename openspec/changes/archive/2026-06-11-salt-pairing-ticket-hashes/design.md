## Context

The bootstrap pairing model uses short development pairing codes such as `123-456` and stores a hash rather than the raw code in `PairingTicket`. The relay creates tickets in memory when the host joins and consumes them when the viewer joins.

The current hash is deterministic across tickets. That is acceptable for not storing raw secrets, but weaker than necessary because same-code reuse can be detected from serialized ticket metadata. This change adds per-ticket salt while keeping the development relay simple and in-memory.

## Goals / Non-Goals

**Goals:**

- Generate per-ticket salt for new pairing tickets.
- Hash pairing codes with the salt for create/consume validation.
- Ensure same pairing code produces different ticket hashes across tickets.
- Preserve raw-secret exclusion from tickets, logs, relay peer state, and audit details.

**Non-Goals:**

- Change the human pairing-code format or length.
- Add production account authentication, durable pairing storage, reconnect semantics, native Windows UI, capture/input, clipboard/file transfer, installer/service behavior, startup persistence, credential access, privilege elevation, hidden sessions, or Windows security prompt bypass.

## Decisions

1. Add a separate `pairingCodeSalt` field instead of embedding salt in the hash string.
   - Rationale: the ticket schema stays explicit and audit/review can verify that salt is present without parsing a compound hash format.
   - Alternative considered: store `sha256:<salt>:<hash>` in `pairingCodeHash`. Rejected because it mixes metadata and digest and complicates schema validation.

2. Keep `pairingCodeHash` as `sha256:<hex>` and hash `salt + ":" + pairingCode`.
   - Rationale: existing hash format remains recognizable while the input gains per-ticket uniqueness.
   - Alternative considered: switch to a password-hashing KDF. Rejected for this dev-only in-memory pairing gate; production identity must be specified separately with stronger controls.

3. Keep pairing code format unchanged for now.
   - Rationale: increasing entropy would change CLI/dev workflows and should be a separate UX-aware change.
   - Alternative considered: longer pairing codes immediately. Rejected as out of scope for this narrow metadata-hardening increment.

## Risks / Trade-offs

- [Risk] Salt does not make a six-digit code unguessable by itself. -> Mitigation: pairing remains short-lived, use-limited, relay-gated, rate-limited, and not a remote-action grant; production identity remains future scope.
- [Risk] Serialized ticket shape changes. -> Mitigation: tickets are internal bootstrap protocol objects with tests updated in lockstep.
- [Risk] Callers might use `hashPairingCode` without a salt. -> Mitigation: require a salt argument and add tests around ticket creation/consumption.
