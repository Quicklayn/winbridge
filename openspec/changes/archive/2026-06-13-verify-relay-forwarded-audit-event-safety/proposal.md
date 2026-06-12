## Why

The relay already limits accepted forwarding audit records to safe routing metadata, and protocol `audit-event.detail` redaction is covered at the protocol layer. Existing relay integration tests prove this for `signal` and `hello`, but not for forwarded host-originated `audit-event` messages whose detail can carry sensitive workflow metadata.

## What Changes

- Add explicit relay integration coverage for forwarded `audit-event` messages.
- Verify the forwarded `audit-event` received by the viewer has sensitive detail values redacted by protocol validation.
- Verify the accepted `relay.message.forwarded` audit detail contains only safe message and recipient routing metadata.
- Verify the relay audit record omits raw audit-event detail values, private reasons, display names, tokens, and remote-content markers.
- No runtime behavior change is intended.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-runtime`: add testable forwarded `audit-event` audit safety coverage to the existing accepted forwarding audit contract.

## Impact

- Affected code: `apps/relay/src/server.integration.test.ts`.
- Affected specs: `openspec/specs/relay-runtime/spec.md`.
- Safety impact: strengthens relay audit confidentiality for forwarded workflow audit messages. This touches relay tests/specs only and does not change screen capture, remote input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, token semantics, authentication, authorization grants, protocol schemas, or audit schemas.
