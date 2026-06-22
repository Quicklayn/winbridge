## Why

The loopback viewer control surface serves an HTML page that contains the
per-run mutation token in an inline script. The surface already uses no-store
and nosniff headers, but it should also constrain browser execution with a
Content Security Policy so the MVP browser surface has a clearer local security
boundary.

## What Changes

- Add a per-response nonce to the viewer local control surface HTML.
- Add a Content-Security-Policy header that allows only same-origin frame/status
  fetches and nonce-bearing inline style/script used by the generated page.
- Keep the mutation token out of response headers and diagnostics.
- Update focused tests, docs, and OpenSpec requirements.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: The viewer local control surface HTML response
  must include a bounded nonce-based CSP for its local page.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts` and
  focused tests.
- Affected docs/specs: agent-shell consent workflow spec, security/architecture
  docs, README if needed.
- APIs: no CLI, protocol, relay, capture, input, auth, or audit API changes.
- Dependencies: no new runtime dependency.
- Safety impact: local browser hardening only. It does not add hidden capture,
  hidden input, unattended access, persistence, service installation, privilege
  elevation, credential access, keylogging, AV/EDR evasion, Windows prompt
  bypass, or new authorization behavior.
