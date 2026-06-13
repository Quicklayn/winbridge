## Why

Authorization and workflow reason fields are bounded and redacted from local diagnostics, but they can still carry secret-bearing text before validation accepts them into protocol or authorization state. Lifecycle reasons should not become a path for raw tokens, credentials, keys, pairing codes, remote content markers, or other sensitive metadata.

## What Changes

- Reject secret-bearing authorization lifecycle reasons in the shared authorization state machine and parsed authorization records.
- Reject secret-bearing authorization-related protocol reasons before parsing, forwarding, trusted event emission, or workflow processing.
- Reject secret-bearing agent-shell CLI and direct runtime workflow reason options before relay connection or workflow message emission.
- Update documentation to state that lifecycle reason text must not contain secret-bearing metadata.
- No new remote access, capture, input, diagnostics, installer, service, startup, privilege, credential, keylogging, stealth, evasion, or prompt-bypass capability is added.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: Add fail-closed validation for secret-bearing lifecycle reason text.
- `session-authorization-protocol`: Add fail-closed validation for secret-bearing authorization protocol reason text.
- `agent-shell-consent-workflow`: Add fail-closed validation for secret-bearing CLI and direct runtime workflow reason options.

## Impact

- Affected code: `packages/protocol` authorization and message schemas/tests, `apps/agent-shell` CLI/runtime validation/tests.
- Affected docs: `README.md`, `docs/security-model.md`.
- Affected specs: session authorization, session authorization protocol, and agent shell consent workflow.
- Security impact: reduces accidental secret propagation through lifecycle reason fields while preserving consent, visibility, revocation, and audit invariants.
