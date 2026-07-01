## ADDED Requirements

### Requirement: MVP smoke supports explicit Windows input mode

The MVP smoke helper SHALL support an explicit `--windows-input` option that
uses the existing consent-bound host Windows input adapter for native input
application. When enabled, the smoke plan MUST pass `--host-apply-input true`
to the host, MUST preserve the existing host approval, visible session state,
host control surface, viewer control surface, signal, guard, frame, protocol
input, audit, revocation, and viewer disconnect checks, and MUST verify a fixed
`windows-input` subcheck from host audit evidence for
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
- **AND** it verifies the fixed `windows-input` subcheck from bounded host audit
  evidence
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

### Requirement: MVP ready supports explicit Windows input smoke gate

The MVP ready helper SHALL support an explicit
`--include-windows-input-smoke` option that runs the bounded smoke command
`mvp:smoke -- --json --windows-input` and accepts JSON only when it contains
the fixed `windows-input` subcheck in addition to every default smoke subcheck.
The helper MUST NOT include the Windows input smoke in default readiness,
role-scoped readiness, or `--include-all-smoke`. The helper MUST fail closed
when included Windows input smoke output omits, duplicates, malforms, renames,
or unexpectedly reports the `windows-input` subcheck. Failure output MUST
remain bounded and MUST NOT echo smoke command output, child output, generated
commands, input contents, PowerShell diagnostics, relay URLs, local URLs, token
values, token environment values, pairing codes, credentials, local paths,
frame bytes, clipboard contents, or full secrets.

#### Scenario: Ready runs explicit Windows input smoke

- **WHEN** a developer runs
  `npm run mvp:ready -- --include-windows-input-smoke --json`
- **THEN** the ready helper runs `mvp:smoke -- --json --windows-input`
- **AND** it accepts and reports the fixed `windows-input` subcheck when every
  required smoke subcheck passes

#### Scenario: Ready rejects malformed Windows input smoke metadata

- **WHEN** the included Windows input smoke result omits, duplicates, malforms,
  or renames the fixed `windows-input` subcheck
- **THEN** the ready helper treats the smoke output as malformed
- **AND** readiness diagnostics use only bounded fixed status metadata

#### Scenario: Ready all-smoke keeps OS input disabled

- **WHEN** a developer runs `npm run mvp:ready -- --include-all-smoke`
- **THEN** the ready helper does not run the Windows input smoke
- **AND** no `mvp:smoke -- --windows-input` command is planned unless
  `--include-windows-input-smoke` is supplied explicitly
