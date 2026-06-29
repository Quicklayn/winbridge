## ADDED Requirements

### Requirement: MVP smoke supports explicit Windows capture mode

The MVP smoke helper SHALL support an explicit `--windows-capture` option that
uses the existing consent-bound host Windows capture source for the smoke frame
path. When enabled, the smoke plan MUST pass
`--dev-screen-frame-source windows-capture` to the host, MUST omit static frame
payload arguments, and MUST keep the existing explicit host approval, visible
session state, finite capture count, viewer surface, signal, guard, protocol
input, audit, revocation, and viewer disconnect checks. The helper MUST NOT
apply OS input, start browser automation, bind a public relay, install services,
configure startup persistence, request privilege elevation, enable unattended
access, bypass Windows prompts, or hide capture/session activity. Success and
failure output MUST remain bounded and MUST NOT echo frame bytes, screen
content, local paths, relay URLs, local URLs, token values, token environment
values, pairing codes, command strings, stdout, stderr, child output,
PowerShell diagnostics, credentials, input contents, clipboard contents, or
full secrets.

#### Scenario: Windows capture smoke is explicit and finite

- **WHEN** a developer runs `npm run mvp:smoke -- --windows-capture` on Windows
- **THEN** the smoke helper starts the existing local relay, host, and viewer
  smoke workflow with the host frame source set to `windows-capture`
- **AND** it verifies the existing bounded smoke checks without exposing frame
  data or command output

#### Scenario: Windows capture smoke fails closed before startup off Windows

- **WHEN** a developer runs `npm run mvp:smoke -- --windows-capture` on a
  non-Windows platform
- **THEN** the smoke helper fails before starting relay, host, viewer, browser,
  capture, input, services, startup persistence, or unattended behavior
- **AND** diagnostics report only bounded fixed reason metadata

#### Scenario: Windows capture smoke keeps OS input disabled

- **WHEN** the smoke helper builds a plan for `--windows-capture`
- **THEN** the host command omits `--host-apply-input true`
- **AND** the plan does not add any native OS input application step
