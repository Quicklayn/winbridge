## ADDED Requirements

### Requirement: MVP ready supports explicit Windows control smoke gate

The MVP ready helper SHALL support an explicit
`--include-windows-control-smoke` option that runs the bounded smoke command
`mvp:smoke -- --json --windows-capture --windows-input`. The helper MUST accept
that step only when smoke JSON contains every default smoke subcheck plus the
fixed `windows-input` subcheck, because the command itself is the reviewed
evidence that the frame subcheck used the Windows capture source. The helper
MUST NOT include this combined native smoke in default readiness, role-scoped
readiness, or `--include-all-smoke`. Failure output MUST remain bounded and
MUST NOT echo smoke command output, child output, generated commands, frame
bytes, screen contents, input contents, PowerShell diagnostics, relay URLs,
local URLs, token values, token environment values, pairing codes,
credentials, local paths, clipboard contents, or full secrets.

#### Scenario: Ready runs explicit Windows control smoke

- **WHEN** a developer runs
  `npm run mvp:ready -- --include-windows-control-smoke --json`
- **THEN** the ready helper runs
  `mvp:smoke -- --json --windows-capture --windows-input`
- **AND** it accepts and reports the fixed `windows-input` subcheck when every
  required smoke subcheck passes

#### Scenario: Ready rejects malformed Windows control smoke metadata

- **WHEN** the included Windows control smoke result omits, duplicates,
  malforms, or renames the fixed `windows-input` subcheck
- **THEN** the ready helper treats the smoke output as malformed
- **AND** readiness diagnostics use only bounded fixed status metadata

#### Scenario: Ready all-smoke keeps combined native control disabled

- **WHEN** a developer runs `npm run mvp:ready -- --include-all-smoke`
- **THEN** the ready helper does not run the combined Windows control smoke
- **AND** no `mvp:smoke -- --windows-capture --windows-input` command is
  planned unless `--include-windows-control-smoke` is supplied explicitly

### Requirement: MVP smoke composes explicit Windows capture and input modes

The MVP smoke helper SHALL allow the existing explicit `--windows-capture` and
`--windows-input` options to be supplied together so the same local smoke
session uses the consent-bound host Windows capture source and the
consent-bound host Windows input adapter. When both options are supplied, the
host command MUST include `--dev-screen-frame-source windows-capture` and
`--host-apply-input true`, MUST keep explicit host approval, visible session
state, audit logging, finite capture count, revocation, and viewer disconnect,
and MUST preserve the fixed `windows-input` smoke JSON subcheck. Off Windows,
the helper MUST fail closed before starting relay, host, viewer, browser,
capture, input, services, startup persistence, privilege elevation, or
unattended behavior. Diagnostics MUST remain bounded and MUST NOT echo frame
bytes, screen contents, input contents, PowerShell diagnostics, generated
command strings, child output, local paths, relay URLs, local URLs, token
values, token environment values, pairing codes, credentials, clipboard
contents, or full secrets.

#### Scenario: Combined Windows control smoke plan is explicit

- **WHEN** the smoke helper builds a plan with both `--windows-capture` and
  `--windows-input`
- **THEN** the host command uses the Windows capture frame source and enables
  host native input application
- **AND** default, LAN, token, LAN-token, capture-only, and input-only smoke
  plans remain unchanged

#### Scenario: Combined Windows control smoke fails closed off Windows

- **WHEN** a developer runs
  `npm run mvp:smoke -- --windows-capture --windows-input` on a non-Windows
  platform
- **THEN** the smoke helper fails before starting child processes or native
  adapters
- **AND** diagnostics report only bounded fixed reason metadata
