## Why

Host visibility is stronger when the host can inspect which bounded viewer device metadata is associated with the current local authorization, not only whether the session is active. The interactive consent prompt already receives safe viewer device id and platform context; the read-only host status surface should expose the same non-authorizing context after a visible approval so future host UI wiring can keep the active session understandable.

## What Changes

- Add optional viewer device id and platform fields to the managed host status snapshot when the host has a current authorization for the observed trusted viewer and safe viewer device metadata was seen in that viewer's `hello`.
- Render those optional fields in the one-shot host status output and interactive host control `status` command.
- Keep device metadata read-only, optional, and non-authorizing; it does not grant permissions or replace account authentication.
- Do not expose viewer display names, peer ids, self-asserted trust levels, raw protocol payloads, tokens, pairing codes, private reasons, screen contents, input contents, clipboard contents, file-transfer contents, or diagnostics dumps through host status.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Extends bounded local host status metadata with optional viewer device id/platform context.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/host-control-prompt.ts`, `apps/agent-shell/src/host-status.test.ts`, `apps/agent-shell/src/host-control-prompt.test.ts`, and `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: `openspec/specs/agent-shell-consent-workflow/spec.md`, `README.md`, `docs/architecture.md`, `docs/security-model.md`, and this OpenSpec change.
- Safety impact: improves host-visible context while preserving explicit consent, active-session visibility, revocation, pause, terminate, disconnect, audit, and fail-closed authorization checks.
- Touches user-visible authorization status surfaces. It does not touch capture, input, relay routing, installer, startup, services, tokens, logs, native Windows APIs, or privilege elevation.
