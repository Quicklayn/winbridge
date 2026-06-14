## Why

WinBridge has release, privacy, security, and OpenSpec gates, but the bootstrap
threat model was only implicit across several documents. Future work is moving
toward identity, transport, and native Windows design, so maintainers need a
single threat-model reference before proposing capture, input, installer,
startup, service, privilege, or production data-handling changes.

## What Changes

- Add a bootstrap threat model covering current scope, assets, trust
  boundaries, key threats, current controls, and future review gates.
- Link the threat model from README, SECURITY policy, and release checklist.
- Extend the repository process spec so release and security review gates keep
  the threat model visible.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-orchestration`: release documentation and review gates now include a
  bootstrap threat model reference.

## Impact

- Affected docs: `docs/threat-model.md`, `README.md`, `SECURITY.md`,
  `docs/release-checklist.md`.
- Affected specs: `openspec/specs/agent-orchestration/spec.md`.
- Runtime impact: none. This does not add capture, input, clipboard,
  file-transfer, diagnostics, installer, startup, service, privilege,
  production identity, production relay, telemetry, hidden-session,
  credential, keylogging, evasion, prompt-bypass, or native Windows behavior.
