## MODIFIED Requirements

### Requirement: Agent shell viewer serves a loopback local control surface

The agent shell CLI SHALL expose an opt-in viewer-only local control surface
that binds only to `127.0.0.1`, requires an explicit validated port, requires
the existing explicit viewer screen-frame output path, and stops with the
viewer CLI process. The surface MUST NOT be reachable on wildcard, LAN, or
public interfaces and MUST NOT start before CLI option validation succeeds. The
HTML page response SHALL include no-store, nosniff, and a bounded nonce-based
Content Security Policy that denies default loads, allows only the generated
same-origin page operations needed by the local surface, and authorizes only
the generated inline style and script blocks that carry the matching nonce. The
per-run mutation token MUST NOT appear in response headers, logs, status JSON,
or diagnostics.

#### Scenario: Viewer starts local control surface

- **WHEN** a viewer CLI process is started with valid local control surface
  options, `screen:view` request permission, local audit configuration, and a
  valid viewer screen-frame output path
- **THEN** it binds the local control surface only to `127.0.0.1` on the
  configured port
- **AND** the generated HTML response includes a nonce-based Content Security
  Policy and matching nonce attributes on its generated inline style and script
  blocks
- **AND** startup diagnostics and HTTP response headers MUST expose only the
  loopback URL, CSP nonce, and bounded metadata, not mutation tokens, pairing
  codes, private reasons, frame bytes, screen contents, input contents,
  credentials, or full secrets
