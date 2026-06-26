## ADDED Requirements

### Requirement: MVP smoke uses ephemeral viewer surface port by default

The root MVP smoke check SHALL pass `--viewer-control-surface-port 0` to the
viewer command by default and SHALL resolve the actual loopback viewer surface
URL from the bounded viewer child output before checking the surface HTML,
`/frame`, `/status`, `/input`, and `/disconnect` paths. The accepted viewer
surface URL MUST use `http://127.0.0.1:<port>/` with a valid non-zero TCP port,
root path, and no credentials, query, or fragment. The smoke check MAY retain
an explicit fixed `surfacePort` test hook for deterministic tests. Failure
diagnostics MUST NOT expose resolved ports, local surface URLs, mutation
tokens, frame paths, relay URLs, raw child output, pairing codes, credentials,
screen contents, input contents, or full secrets. The smoke check MUST remain
local and MUST NOT launch browsers, bind the viewer surface to LAN/public
interfaces, discover network addresses, probe remote hosts, open firewall
ports, use Windows capture, apply OS input, install services, configure startup
persistence, elevate privileges, run unattended, evade AV/EDR, bypass Windows
prompts, or hide the host visible-session state.

#### Scenario: Default smoke resolves the runtime viewer surface URL

- **WHEN** a developer runs `npm run mvp:smoke` without an explicit test-only
  surface port
- **THEN** the smoke viewer command uses `--viewer-control-surface-port 0`
- **AND** the smoke helper waits for the bounded viewer local control surface
  log marker
- **AND** it uses the resolved `127.0.0.1` URL internally for the existing
  surface, signal, guard, input, lifecycle, audit, and disconnect checks
- **AND** human and JSON output still include only fixed smoke subcheck
  metadata and bounded artifact/audit summary metadata

#### Scenario: Unsafe viewer surface URL markers fail closed

- **WHEN** the viewer child output is missing the surface URL marker, contains
  a malformed marker, or reports a URL with a non-loopback host, credentials,
  query, fragment, non-root path, port `0`, or invalid port
- **THEN** the smoke helper treats the surface as not ready
- **AND** diagnostics MUST NOT echo the unsafe marker, URL, port, child output,
  token, pairing code, credential, screen content, input content, or full secret
