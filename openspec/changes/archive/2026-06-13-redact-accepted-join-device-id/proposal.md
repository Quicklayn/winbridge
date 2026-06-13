## Why

Accepted join audit records must never contain raw pairing codes. A schema-valid `deviceIdentity.deviceId` can still embed the submitted pairing code, so accepted join identity audit needs the same redaction guard used for denied join attribution.

## What Changes

- Redact accepted join `deviceIdentity.deviceId` when it contains the submitted pairing code.
- Preserve bounded non-secret accepted identity metadata: `platform`, `trustLevel`, `createdAt`, and either safe `deviceId` or bounded redaction metadata.
- Add relay integration coverage for host and viewer accepted joins with device ids that contain pairing codes.
- Keep accepted identity metadata audit-only and non-authorizing.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-runtime`: accepted join device identity audit metadata redacts device ids that contain submitted pairing codes.

## Impact

- Touches relay and logs/audit behavior.
- Affected code: `apps/relay/src/server.ts` and relay integration tests.
- No capture, input, installer, startup, service, token, privilege elevation, or native Windows API changes.
- No wire protocol breaking change and no new dependency.
