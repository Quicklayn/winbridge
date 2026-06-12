## Why

The relay already requires accepted forwarding audit records to include only safe routing metadata and to omit user display metadata. Existing tests prove this for `signal` and authorization request forwarding, but not for forwarded `hello` presence metadata.

## What Changes

- Add explicit relay-runtime coverage for forwarded `hello` audit metadata.
- Verify accepted `hello` forwarding audit includes only message type, message id, recipient peer id, and recipient role.
- Verify accepted `hello` forwarding audit omits raw display names and capability metadata.
- No runtime behavior change is intended.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-runtime`: add testable forwarded `hello` audit safety coverage to the existing accepted forwarding audit contract.

## Impact

- Affected code: `apps/relay/src/server.integration.test.ts`.
- Affected specs: `openspec/specs/relay-runtime/spec.md`.
- Safety impact: strengthens audit verification for relay-forwarded presence metadata. It touches relay tests/specs only and does not change screen capture, remote input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, token semantics, authentication, authorization grants, or audit schemas.
