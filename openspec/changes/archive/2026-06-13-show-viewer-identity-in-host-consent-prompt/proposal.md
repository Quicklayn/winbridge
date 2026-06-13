## Why

The safety boundary says the host should see viewer identity and requested permissions before approving access, but the development host consent prompt currently shows only permission metadata. Showing bounded, already-validated viewer identity in the prompt makes the bootstrap consent loop closer to the intended product behavior before native Windows UI work starts.

## What Changes

- Extend the interactive host decision provider request with trusted viewer identity metadata from the observed peer binding.
- Render viewer peer id and validated display name in the host-facing consent prompt before the `approve`/`deny` input.
- Keep prompt output bounded and secret-safe: no raw protocol payloads, tokens, pairing codes, private reasons, signal payloads, screen/input/clipboard/file/diagnostics content, or unvalidated identity values.
- Preserve fail-closed behavior for timeout, invalid input, stale/disconnected viewer, invisible approval, lifecycle controls, and all non-interactive/static approval paths.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: interactive host consent prompt includes bounded viewer identity metadata before host approval.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/host-consent-prompt.ts`, prompt/runtime tests, and test runner reporter configuration if needed for stable verification.
- Affected docs: `README.md`, `docs/architecture.md`, `docs/security-model.md`.
- Security touchpoints: host consent UX and log/prompt redaction boundaries. This change does not touch capture, input, relay routing, installer behavior, startup persistence, services, tokens, privilege elevation, WebRTC, or native Windows APIs.
