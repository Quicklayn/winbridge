## Why

Agent-shell device identifiers are sent in join-session metadata and can become pairing metadata. Today CLI and direct runtime validation only enforce identifier syntax, so a user can accidentally place token-, credential-, cookie-, key-, or auth-looking material in a device id and rely on downstream audit redaction instead of failing closed at the agent boundary.

## What Changes

- Reject secret-bearing agent-shell device ids in CLI `--device` and direct runtime `deviceId` validation before relay connection or protocol sends.
- Keep generated default device ids and safe custom device ids valid.
- Keep relay/protocol audit redaction behavior unchanged; this change adds an earlier agent-shell validation boundary.
- Safety impact: fail-closed metadata hygiene only. This does not add or change capture, input, clipboard, file transfer, diagnostics export, relay routing, installer behavior, startup behavior, services, privilege elevation, token storage, or log persistence.
- Non-goals: changing shared protocol `DeviceIdentitySchema`, changing relay pairing semantics, or introducing any native Windows remote control behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: agent-shell CLI and managed runtime device-id validation reject secret-bearing protocol identifier metadata before relay startup.

## Impact

- Code: `apps/agent-shell/src/args.ts`, `apps/agent-shell/src/runtime.ts`.
- Tests: focused agent-shell CLI parsing and managed runtime validation tests.
- Docs/specs: OpenSpec `agent-shell-consent-workflow` delta and concise docs for the device-id metadata boundary.
- APIs/dependencies: no new dependencies and no public protocol schema change.
