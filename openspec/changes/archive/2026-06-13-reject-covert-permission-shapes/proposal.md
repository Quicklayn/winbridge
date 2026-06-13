## Why

WinBridge currently enforces a closed permission vocabulary, but only diagnostics has an explicit denial contract in the specs and regression tests. Covert or high-risk administrative permission-shaped strings must be visibly rejected so future work cannot accidentally treat them as consentable remote-assistance scope.

## What Changes

- Specify that covert and high-risk administrative/native permission-shaped strings remain outside the current authorization vocabulary.
- Add protocol and authorization regression coverage for representative strings such as `remote-shell`, `admin:run`, `unattended:access`, `persistence:install`, `service:install`, `startup:persist`, `privilege:elevate`, `credential:read`, `keylog:capture`, `stealth:session`, and `windows-prompt:bypass`.
- Update the security model documentation to describe the current permission boundary and future review gate.
- No new remote-control, capture, input, installer, service, startup, privilege, credential, keylogging, stealth, evasion, or prompt-bypass capability is added.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `safety-boundaries`: Clarify that covert and high-risk administrative/native permission shapes are not valid current authorization scope.
- `session-authorization`: Require the shared authorization state machine and grant validation to reject these permission shapes in request, grant, state, revocation, and action checks.
- `session-authorization-protocol`: Require authorization protocol messages to reject these permission shapes before parsing or forwarding.

## Impact

- Affected code: `packages/protocol` authorization and protocol tests.
- Affected docs: `docs/security-model.md`.
- Affected specs: safety boundaries, session authorization, and session authorization protocol.
- Security impact: strengthens deny-by-default behavior for auth/protocol scope; it does not add or widen any remote capability.
