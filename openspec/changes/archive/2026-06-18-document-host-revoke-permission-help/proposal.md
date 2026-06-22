## Why

The MVP host can revoke individual permissions, including `screen:view`,
`input:pointer`, and `input:keyboard`, but the interactive host prompt help and
some user-facing documentation only make `revoke screen:view` discoverable. This
creates unnecessary friction for the host's immediate input revocation path.

## What Changes

- Update the interactive host control prompt static help text to list each MVP
  permission-specific revoke command explicitly.
- Update focused tests to assert that `revoke input:pointer` and
  `revoke input:keyboard` remain accepted and visible in help.
- Update README/security/architecture wording so host revoke discoverability
  matches the MVP command kit.
- Keep the parser permission allowlist and existing runtime revoke gates
  unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Host control prompt help must make the MVP
  permission-specific revoke commands discoverable without expanding the
  accepted permission vocabulary.

## Impact

- Affected code: `apps/agent-shell/src/host-control-prompt.ts` and focused
  tests.
- Affected docs/specs: README, architecture/security docs, and agent-shell
  consent workflow spec.
- APIs: no CLI flags, protocol messages, relay APIs, native capture/input APIs,
  installer, startup, service, token, log, or privilege-elevation changes.
- Safety impact: discoverability only. This does not add hidden capture, hidden
  input, unattended access, persistence, credential access, keylogging, AV/EDR
  evasion, Windows prompt bypass, or new authorization behavior.
