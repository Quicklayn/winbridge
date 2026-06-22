## Why

The MVP command kit prints default local artifact paths such as
`logs\host-audit.jsonl`, `logs\viewer-audit.jsonl`, and `frames\latest.jpg`.
A fresh checkout should not fail the first authorized run merely because the
developer has not manually created those local parent directories.

## What Changes

- Make the existing file audit sink directory-creation behavior an explicit
  OpenSpec requirement for local JSONL audit persistence.
- Make the existing viewer latest-frame output directory-creation behavior an
  explicit OpenSpec requirement before same-directory temporary publication.
- Add a focused test that verifies viewer frame output creates its parent
  directory before publishing a frame.
- Update MVP documentation so operators know the default `logs` and `frames`
  paths are created on first authorized write, while path validation and write
  failures remain fail-closed.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `audit-log-persistence`: File audit persistence must create parent
  directories for safe configured local paths before appending JSONL records.
- `agent-shell-consent-workflow`: Viewer latest-frame output must create the
  configured output directory before temporary frame publication.
- `mvp-session-command-kit`: Printed default local artifact paths must be
  ready for a fresh checkout without requiring manual pre-run directory setup.

## Impact

- Affected code: focused tests for viewer frame output.
- Affected docs/specs: README, architecture/security docs, OpenSpec specs.
- APIs: no CLI, protocol, relay, or package API changes.
- Dependencies: no new runtime dependency.
- Safety impact: touches local development file handling only. It does not add
  hidden capture, hidden input, unattended access, persistence, service
  installation, privilege elevation, credential access, keylogging, AV/EDR
  evasion, Windows prompt bypass, or new authorization behavior.
