## Why

Host audit records should show whether the host made an authorization decision with viewer-provided context, without storing the raw request reason. This improves accountability for consent decisions while preserving the existing secret-safe reason redaction model.

## What Changes

- Add secret-safe `requestReasonProvided` boolean metadata to development authorization approval and denial audit events.
- Keep raw viewer request reason text out of protocol audit details, local audit persistence, runtime events, logs, and status output.
- Preserve existing host approval, visible-session activation, permission grants, denial, revocation, pause, termination, disconnect, and fail-closed behavior.
- No new remote access capability is added.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Adds secret-safe request-reason presence metadata to host authorization decision audit events.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: `openspec/specs/agent-shell-consent-workflow/spec.md` and this archived OpenSpec change.
- Safety impact: improves auditability without exposing raw viewer reason text or adding capture, input, relay transport, installer, startup, services, token handling, native Windows APIs, persistence, or privilege elevation behavior.
- Touches auth/audit metadata only. It does not touch capture, input, relay routing, installer, startup, services, tokens, logs beyond existing audit event detail shape, or privilege elevation.
