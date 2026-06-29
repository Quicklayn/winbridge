## Why

The viewer local control surface is loopback-only and mutation-protected, but
read-only `GET` routes should also fail closed when the request `Host` header
does not match the resolved loopback surface URL. This reduces DNS-rebinding and
misdirected-origin exposure risk for the development MVP surface.

## What Changes

- Require viewer local control surface requests to use the exact resolved
  loopback `Host` value, including the assigned port.
- Reject mismatched or missing `Host` headers before serving HTML, status,
  frame bytes, input, or disconnect routes.
- Preserve the existing loopback bind, same-origin mutation token, CSP, no-store
  responses, and sanitized diagnostics.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: harden the opt-in viewer local control surface
  request boundary with strict loopback Host-header validation.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts`.
- Affected tests: viewer local control surface tests.
- Touch areas: local HTTP surface, frame/status read exposure, input/disconnect
  mutation boundary. No relay, installer, startup, service, privilege,
  production auth, or token value handling changes.

## Safety Impact

This change narrows access to an existing local development surface. It does not
add capture, input, hidden session, unattended access, persistence, credential
access, keylogging, AV/EDR evasion, or Windows prompt bypass behavior.

## Non-Goals

- No production desktop viewer UI.
- No new remote-control permission or input event kind.
- No LAN/public exposure of the local surface.
- No CORS support or cross-origin embedding.
