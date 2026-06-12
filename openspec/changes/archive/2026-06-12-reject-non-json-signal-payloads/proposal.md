## Why

`signal` protocol payloads are forwarded as JSON envelopes, but the current schema accepts arbitrary JavaScript values and only measures them with `JSON.stringify`. Values such as functions, symbols, `undefined`, non-finite numbers, cyclic structures, sparse arrays, or non-enumerable properties can be dropped, coerced, or fail late, weakening protocol integrity at a remote-assistance transport boundary.

## What Changes

- Require `signal.payload` to be a JSON-compatible object before parsing, encoding, forwarding, or local runtime send/receive handling.
- Reject non-JSON signal payload values that cannot be represented faithfully in JSON.
- Preserve existing `authorizationId`, size-limit, and sensitive-key rejection behavior for accepted JSON-compatible payloads.
- Reuse or extract the existing JSON-compatible value validation pattern so audit detail and signal payload validation do not diverge.
- Add protocol and relay integration tests for rejected non-JSON signal payloads.
- Non-goals: no screen capture, input injection, clipboard, file transfer, diagnostics, native Windows API, installer, startup, service, token format, privilege elevation, hidden session, reconnect, or production transport changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: `signal` payload safety now includes JSON-compatible object validation and fail-fast rejection of non-representable runtime values.
- `relay-runtime`: relay tests must prove non-JSON `signal` payloads are rejected before forwarding and without unsafe audit output.
- `agent-shell-consent-workflow`: agent runtime `signal` send/receive validation must inherit the protocol JSON-compatible payload contract without weakening consent gates.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, protocol tests, relay integration tests, and docs/specs.
- Affected APIs: callers passing non-JSON JavaScript values in `signal.payload` will now receive schema validation errors before serialization.
- Affected systems: development relay forwarding and agent-shell public/runtime signal validation because both use shared protocol parsing/encoding.
- Safety impact: strengthens networking/protocol integrity for remote-assistance signaling. Touches networking and relay behavior; requires security review.
