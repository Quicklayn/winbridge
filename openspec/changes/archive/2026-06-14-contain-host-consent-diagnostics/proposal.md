## Why

Interactive host consent is a host approval gate. If the configured host decision provider throws, the runtime must fail closed before sending any authorization decision, active state, control, signal, or audit message. The current catch path reports sanitized diagnostics with the general runtime diagnostic helper, but a throwing diagnostic event callback or logger can escape that catch path and prevent the explicit fail-closed return.

## What Changes

- Guard diagnostics emitted after interactive host consent provider failure so throwing `onEvent` or logger callbacks cannot block fail-closed consent handling.
- Preserve the existing behavior that provider failure emits only bounded sanitized diagnostics when diagnostic callbacks cooperate.
- Preserve ordinary fail-closed audit behavior for approval, denial, active state, and other host workflow sends.
- Add regression coverage for provider failure plus throwing diagnostic callback/logger.
- Update security documentation to state that consent provider diagnostics are best-effort and non-authorizing.
- Non-goals: no capture, input, clipboard, file transfer, diagnostics access, reconnect, native Windows UI/API, installer, service, startup persistence, privilege elevation, credential access, hidden sessions, relay protocol schema changes, or production audit durability changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: interactive host consent provider failure diagnostics must be best-effort and must not weaken fail-closed consent handling.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: `docs/security-model.md`, `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Security scope: touches host consent, diagnostics, and logs. Requires security review.
- API/dependency impact: no public API changes, no protocol schema changes, no new dependencies.
