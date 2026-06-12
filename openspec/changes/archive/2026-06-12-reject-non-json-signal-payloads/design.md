## Context

WinBridge currently treats `signal` messages as the only protocol message class that can carry transport-specific payload metadata such as SDP or ICE candidates. The schema enforces a top-level `authorizationId`, size limit, and sensitive-key rejection, but the payload itself is still typed as `Record<string, unknown>`.

Because protocol envelopes are JSON-encoded, allowing arbitrary JavaScript values creates a mismatch: `JSON.stringify` can silently omit function or `undefined` fields, convert non-finite numbers to `null`, ignore symbol-keyed and non-enumerable properties, or throw only at a later encode path. This change closes that mismatch at parse/encode time.

## Goals / Non-Goals

**Goals:**
- Validate `signal.payload` as a JSON-compatible object before protocol parse/encode succeeds.
- Reject payload structures that JSON would silently drop or coerce.
- Preserve existing signal requirements: top-level valid `authorizationId`, non-empty payload, size bound, and sensitive-key rejection.
- Reuse a shared JSON-compatible object validator for protocol payload classes that need faithful JSON representation.

**Non-Goals:**
- No native Windows screen capture, input injection, clipboard, file transfer, diagnostics, installer, service, startup, privilege, reconnect, or production WebRTC changes.
- No changes to signal routing, authorization state machines, relay pairing, token semantics, or remote action permissions.
- No coercion of unsupported runtime values into strings or placeholders.

## Decisions

### Use a shared JSON-compatible object schema

Add a shared protocol JSON object schema that accepts only JSON primitives, arrays, and plain objects whose own properties can be faithfully represented in JSON. It rejects functions, symbols, bigint, `undefined`, non-finite numbers, cyclic structures, accessor properties, own symbol-keyed properties, own non-enumerable properties, sparse arrays, non-index array properties, and inherited `toJSON` hooks that would change the encoded JSON output.

Rationale: audit detail already needs this exact behavior, and signal payloads have the same faithful-JSON requirement. Sharing the validator reduces drift between audit and networking contracts.

Alternative considered: leave audit validation separate and add an ad hoc signal validator. That would work in the short term but increases the chance of inconsistent JSON compatibility rules.

### Validate signal payloads before signal-specific checks

`SignalMessageSchema` will use the shared JSON object schema for `payload`, then continue applying authorization id, empty object, size, and sensitive-key checks.

Rationale: signal-specific checks should run only on a payload representation that can actually be sent as JSON. This avoids counting or scanning a value that would later serialize differently.

Alternative considered: keep `z.record(z.unknown())` and rely on `measureSignalPayloadBytes`. That catches bigint but does not prevent silent omission or coercion.

### Reject instead of normalizing unsupported values

Non-JSON values fail validation. The protocol does not stringify or replace them.

Rationale: unsupported signal payload shapes are caller bugs at a security boundary. Rejection is safer than generating a different wire representation than the caller supplied.

Canonical snapshots used for protocol encoding must not inherit `toJSON`, so prototype pollution cannot change the wire JSON after validation.

## Risks / Trade-offs

- [Risk] Existing tests or local callers may pass JavaScript-only signal payload fixtures. -> Mitigation: update tests to use JSON-compatible fixtures on success paths and explicit rejection tests for invalid fixtures.
- [Risk] Shared validator refactor could change audit detail behavior. -> Mitigation: keep audit test coverage and run focused protocol/audit tests.
- [Risk] Rejecting accessor properties can surprise callers using class instances. -> Mitigation: protocol payloads should be plain JSON data; class instances are not wire contracts.

## Migration Plan

This is a bootstrap protocol tightening. Development callers must pass JSON-compatible signal payloads. Existing valid JSON protocol messages continue to parse.

Rollback is a normal revert if local development workflows rely on unsupported runtime-only payload values.

## Open Questions

None.
