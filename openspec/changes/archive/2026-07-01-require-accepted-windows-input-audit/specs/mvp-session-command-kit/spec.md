## MODIFIED Requirements

### Requirement: MVP smoke supports explicit Windows input mode

The MVP smoke helper SHALL support an explicit `--windows-input` option that
uses the existing consent-bound host Windows input adapter for native input
application. When enabled, the smoke plan MUST pass `--host-apply-input true`
to the host, MUST preserve the existing host approval, visible session state,
host control surface, viewer control surface, signal, guard, frame, protocol
input, audit, revocation, and viewer disconnect checks, and MUST verify a fixed
`windows-input` subcheck from accepted host audit evidence for
`agent-shell.remote-interaction.input-event.applied`. The helper MUST NOT enable
OS input by default, start browser automation, bind a public relay, install
services, configure startup persistence, request privilege elevation, enable
unattended access, bypass Windows prompts, read credentials, read clipboard
contents, keylog, evade AV/EDR, or hide capture/session/input activity. Success
and failure output MUST remain bounded and MUST NOT echo input contents,
PowerShell diagnostics, generated command strings, child output, local paths,
relay URLs, local URLs, token values, token environment values, pairing codes,
authorization ids, credentials, clipboard contents, or full secrets.

#### Scenario: Windows input smoke is explicit and finite

- **WHEN** a developer runs `npm run mvp:smoke -- --windows-input` on Windows
- **THEN** the smoke helper starts the existing local relay, host, and viewer
  smoke workflow with host native input application enabled
- **AND** it verifies the fixed `windows-input` subcheck from bounded accepted
  host audit evidence
- **AND** diagnostics do not expose input payloads, command contents, child
  output, local paths, URLs, tokens, pairing codes, credentials, clipboard
  contents, PowerShell diagnostics, or secrets

#### Scenario: Windows input smoke rejects denied or failed evidence

- **WHEN** the host audit log contains only denied or failed
  `agent-shell.remote-interaction.input-event.applied` evidence
- **THEN** the smoke helper fails closed with bounded `windows-input-not-ready`
  diagnostics
- **AND** diagnostics do not expose input payloads, command contents, child
  output, local paths, URLs, tokens, pairing codes, credentials, clipboard
  contents, PowerShell diagnostics, or secrets

#### Scenario: Windows input smoke fails closed before startup off Windows

- **WHEN** a developer runs `npm run mvp:smoke -- --windows-input` on a
  non-Windows platform
- **THEN** the smoke helper fails before starting relay, host, viewer, browser,
  capture, input, services, startup persistence, privilege elevation, or
  unattended behavior
- **AND** diagnostics report only bounded fixed reason metadata

#### Scenario: Default smoke keeps OS input disabled

- **WHEN** the smoke helper builds a default plan or a `--windows-capture` plan
- **THEN** the host command omits `--host-apply-input true`
- **AND** the plan does not add the fixed `windows-input` subcheck
