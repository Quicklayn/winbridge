## Why

The development MVP viewer surface reads the latest authorized frame from a local file while the viewer runtime may be replacing that file. Direct writes to the final path can expose a partially written image to the browser, making the MVP look broken even when consent, capture, relay, and audit gates are correct.

## What Changes

- Write viewer latest-frame bytes to a temporary file in the same directory, then atomically replace the configured output path.
- Keep the existing viewer-only `--viewer-screen-frame-output` path validation, authorization gates, local audit requirement, and metadata-only diagnostics unchanged.
- Ensure temporary output artifacts use bounded deterministic names derived from the configured file path and are cleaned up on write failure when possible.
- Update tests and docs so the local viewer surface contract requires complete current-run frame bytes, not partially written output.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Viewer latest-frame output must publish complete frame files atomically so the local viewer surface never treats a partially written frame as trusted current state.

## Impact

- Affected code: `apps/agent-shell/src/screen-frame-output.ts`, focused agent-shell tests, README/security/architecture docs, OpenSpec specs.
- APIs: no CLI, protocol, relay, or package API changes.
- Dependencies: no new runtime dependency.
- Safety impact: touches viewer frame output and local file handling only. It does not add hidden capture, hidden input, unattended access, persistence, service installation, privilege elevation, credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or new authorization behavior.
