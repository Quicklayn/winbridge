## MODIFIED Requirements

### Requirement: MVP session command kit prints validated visible-session commands

The project SHALL provide a root development command kit that prints preflight,
relay, host, viewer, and browser commands for a Windows-to-Windows MVP remote
assistance session. The printed preflight section SHALL instruct the developer
to run the root MVP doctor and root MVP native preflight on each Windows
machine, and the root MVP smoke check as a local static preflight before
starting the two-PC trial. The printed relay address guidance SHALL show the
validated relay URL, state that `localhost` relay URLs are only for same-machine
trials, and instruct two-PC users to rerun the command kit with an explicit LAN
IP or DNS relay URL for the relay PC. When the validated relay URL uses a
non-loopback hostname, the printed relay command SHALL explicitly set the
development relay bind host to `0.0.0.0` before starting relay. When the
validated relay URL uses an effective port other than `8787`, the printed relay
command SHALL explicitly set `WINBRIDGE_RELAY_PORT` to that effective port
before starting relay. The printed relay command SHALL use a root helper that
builds the workspace packages required by the development relay before starting
relay. The printed host command SHALL require an explicit host action to run,
keep the session visible, prompt the host interactively before approval, enable
host-side terminal controls after active visible approval, configure
metadata-only audit, opt in to host input application, use a finite Windows
capture stream, and request only currently reviewed permissions. The printed
viewer command SHALL configure metadata-only audit, explicit latest frame
output, and a loopback local control surface. The printed browser step SHALL be
a visible PowerShell command that opens the already validated loopback viewer
surface URL on the viewer PC when the developer explicitly runs it, while
keeping that loopback URL inspectable in the generated output. The printed
browser step SHALL include bounded static guidance that browser pointer actions
require `frame=ready` and the visible `Pointer Off/On` control before pointer
input can be sent. The default printed local audit and latest-frame paths SHALL
be backed by runtime sinks that create safe parent directories on first
authorized write, so a fresh checkout does not require manual `logs` or
`frames` directory setup before the developer runs the printed commands. The
root agent helper used by those printed host and viewer commands SHALL build
the workspace packages required by the generated MVP audit, capture, and input
workflow before starting agent-shell.

#### Scenario: Custom relay URL port is printed for relay startup
- **WHEN** the command kit prints commands for a validated relay URL whose effective port is not `8787`
- **THEN** the relay command explicitly sets `WINBRIDGE_RELAY_PORT` to that port
- **AND** the host and viewer commands use the same validated relay URL
- **AND** the command kit itself MUST NOT start relay, host, viewer, browser, capture, input, socket, HTTP, service, startup persistence, privilege, unattended, or Windows prompt actions

### Requirement: MVP doctor validates local readiness without side effects

`npm run mvp:doctor` SHALL validate local MVP readiness before a two-PC trial
without starting relay, host, viewer, browser, capture, input, services,
startup persistence, unattended access, or network listeners. The doctor SHALL
check the local Windows platform, supported Node runtime, required root scripts
including `mvp:native-preflight`, required workspace manifests, and required
static MVP source entrypoints. Its success output SHALL include bounded
readiness lines for platform, Node, scripts, workspaces, entrypoints, and
visible-consent safety. Its failure output SHALL use bounded reason codes only
and MUST NOT include raw paths, tokens, pairing codes, credentials, screen
contents, keystrokes, or full secrets.

#### Scenario: Doctor passes with required entrypoints
- **WHEN** the user runs `npm run mvp:doctor` on a Windows machine with the supported Node runtime, required scripts, required workspace manifests, and required MVP entrypoint files
- **THEN** it reports readiness for platform, Node, scripts, workspaces, entrypoints, and visible-consent safety
- **AND** it does not start relay, host, viewer, browser, capture, input, services, startup persistence, unattended access, or network listeners

#### Scenario: Doctor fails when an entrypoint is missing
- **WHEN** a required MVP source entrypoint file is missing
- **THEN** the doctor exits with a bounded `missing-entrypoint` reason
- **AND** the output MUST NOT include the missing path, tokens, pairing codes, credentials, screen contents, keystrokes, or full secrets

#### Scenario: Doctor rejects unsupported local prerequisites
- **WHEN** the local platform, Node runtime, root scripts, workspace manifests, or source entrypoints are unsupported or incomplete
- **THEN** the doctor fails closed with a bounded reason code before starting relay, host, viewer, browser, capture, input, services, startup persistence, unattended access, or network listeners

## ADDED Requirements

### Requirement: MVP native preflight validates native Windows readiness without side effects

`npm run mvp:native-preflight` SHALL validate local Windows native prerequisites
for the development MVP host path without invoking screen capture, applying OS
input, starting relay, host, viewer, browser, sockets, HTTP listeners, services,
startup persistence, unattended access, privilege elevation, clipboard, file
transfer, diagnostics dumps, AV/EDR evasion, Windows prompt bypass, or hidden
session behavior. The preflight SHALL check Windows platform, bounded
PowerShell execution, capture prerequisite assembly/type availability, and input
wrapper compilation readiness. Success output SHALL be bounded readiness
metadata only. Failure output SHALL use bounded reason codes only and MUST NOT
echo raw PowerShell output, local file paths, tokens, pairing codes,
credentials, screen contents, input contents, keystrokes, private reasons, or
full secrets.

#### Scenario: Native preflight passes on a prepared Windows host
- **WHEN** a developer runs `npm run mvp:native-preflight` on a Windows machine where the fixed PowerShell prerequisite checks succeed
- **THEN** it reports bounded readiness lines for Windows platform, PowerShell, capture prerequisites, input prerequisites, and read-only safety
- **AND** it exits without starting WinBridge runtime processes, opening network listeners, capturing the screen, applying input, writing files, launching a browser, installing services, configuring startup persistence, elevating privileges, running unattended, or bypassing Windows prompts

#### Scenario: Native preflight fails closed
- **WHEN** the platform is not Windows, PowerShell is unavailable, capture prerequisites cannot be loaded, or input prerequisites cannot be compiled
- **THEN** it exits non-zero with a bounded reason code
- **AND** diagnostics MUST NOT expose raw PowerShell output, local paths, tokens, pairing codes, credentials, screen contents, input contents, keystrokes, private reasons, or full secrets

#### Scenario: Native preflight remains read-only
- **WHEN** the native preflight runs its fixed PowerShell checks
- **THEN** those checks MUST NOT call `CopyFromScreen`, call `SendInput`, create input arrays, read clipboard data, read arbitrary files, write files, open sockets, start services, configure startup persistence, launch browsers, elevate privileges, run unattended, evade AV/EDR, or bypass Windows prompts
