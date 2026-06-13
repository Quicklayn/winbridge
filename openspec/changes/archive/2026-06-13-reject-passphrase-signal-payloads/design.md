## Context

The shared protocol schema already rejects `signal.payload` keys that look like remote-assistance content or credentials before relay forwarding and agent encoding. The marker list includes `password`, but not the common credential marker `passphrase`.

This change is a narrow validation hardening change in `packages/protocol`. It does not add a remote-assistance workflow, capture, input, relay routing behavior, authentication, token handling, audit persistence, or native Windows behavior.

## Goals / Non-Goals

**Goals:**

- Treat passphrase-bearing signal payload keys as sensitive credential metadata.
- Reject passphrase-bearing keys recursively in objects and arrays.
- Cover both `parseProtocolEnvelope` and `encodeProtocolEnvelope` so validation is consistent before forwarding and before serialization.
- Keep non-secret lifecycle identifiers such as `authorizationId` valid.

**Non-Goals:**

- No new signal payload fields, transport behavior, relay routing, authentication, token storage, audit sink, logging sink, capture, input, clipboard, file-transfer, diagnostics, installer, startup, service, or privilege behavior.
- No production credential manager or account identity system.
- No changes to allowed safe key-exchange metadata such as non-secret `keyExchange` or `publicKeyFingerprint` fields.

## Decisions

- Add `passphrase` to the existing normalized signal sensitive-key indicator list.
  - Rationale: the current validator normalizes key names by removing separators and lowercasing, so one marker covers `passphrase`, `passPhrase`, `pass-phrase`, and nested variants without new parsing logic.
  - Alternative considered: add ad hoc regular expressions for passphrase variants. Rejected because the existing normalized indicator model is simpler and already used for adjacent credential markers.

- Add tests to the existing signal sensitive-key test area rather than creating a new validator module.
  - Rationale: the behavior is part of the protocol envelope contract, and existing tests already exercise parse and encode paths.
  - Alternative considered: test through the relay only. Rejected because relay behavior depends on the shared protocol schema; schema-level tests localize the contract and keep feedback fast.

## Risks / Trade-offs

- [Risk] A benign application payload could use a passphrase-like key name. -> Mitigation: signal payloads are development metadata only, and credential-like keys are intentionally blocked before forwarding to keep signaling secret-safe.
- [Risk] Marker lists can drift as new credential names appear. -> Mitigation: this change extends the existing list and adds explicit tests so future hardening has a clear pattern.
