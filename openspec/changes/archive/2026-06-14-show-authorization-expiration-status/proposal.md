## Why

Host and viewer status surfaces show whether a session is active, but they do not show when the current authorization grant expires. Expiration is an important consent boundary, so the local indicator and status views should expose that bounded lifecycle metadata without adding any remote capability.

## What Changes

- Include the current authorization `expiresAt` timestamp in host indicator events and logs while the visible authorization is active or paused.
- Include optional `expiresAt` metadata in host and viewer status snapshots for active or paused visible authorizations.
- Render `expiresAt` in host control/status CLI output and viewer status output when present.
- Keep inactive, terminal, local leave, socket-close, and trusted disconnect status outputs from retaining stale expiration metadata.
- No capture, input, reconnect, production identity, or native Windows capability is introduced.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: expose bounded authorization expiration metadata in local indicator and status surfaces.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, host/viewer status formatters, host/viewer control/status tests, and focused runtime integration tests.
- Affected behavior: local-only CLI/runtime status and host indicator metadata.
- Security impact: improves consent visibility by showing grant expiry while preserving existing fail-closed gates and secret redaction.
- Touch areas: auth/authorization lifecycle metadata, host-visible indicator logging, status CLI output. This does not touch capture, input execution, relay routing, installer behavior, startup persistence, services, tokens, privilege elevation, Windows security prompts, or native Windows APIs.
- Non-goals: screen frame transport, pointer or keyboard delivery, clipboard, file transfer, diagnostics content, unattended access, stealth behavior, production account identity, or changing the authorization TTL policy.
