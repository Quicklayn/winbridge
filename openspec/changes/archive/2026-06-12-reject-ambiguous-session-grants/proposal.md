## Why

The newer session authorization state machine already rejects empty and duplicate grant scopes, but the older consent-bound `SessionGrantSchema` still accepts them. A grant record with empty or duplicated permissions is ambiguous authorization metadata and should fail schema validation before any remote action check can use it.

## What Changes

- Reject `SessionGrantSchema.permissions` when the permission list is empty.
- Reject duplicate `SessionGrantSchema.permissions` entries.
- Preserve the existing maximum grant scope size and explicit host approval / visible-session literals.
- Add focused tests for empty and duplicate session grant scopes.
- Document that consent-bound session grants must carry a non-empty unique permission scope.
- Safety impact: this touches shared authorization schema validation only. It does not add capture, input, clipboard, file transfer, installer, startup, service, credential access, token disclosure, privilege elevation, or hidden access.

## Capabilities

### New Capabilities

### Modified Capabilities
- `session-authorization`: Consent-bound session grant records must reject empty or duplicate permission scopes before action authorization.

## Impact

- `packages/protocol`: session grant schema validation and tests.
- `docs`: security model clarification for consent-bound grants.
- OpenSpec: added session grant schema invariant requirement under session authorization.
