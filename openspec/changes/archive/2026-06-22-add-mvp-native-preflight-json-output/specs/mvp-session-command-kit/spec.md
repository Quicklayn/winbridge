## MODIFIED Requirements

### Requirement: MVP native preflight validates native Windows readiness without side effects

`npm run mvp:native-preflight` SHALL validate local Windows native prerequisites
for the development MVP host path without invoking screen capture, applying OS
input, starting relay, host, viewer, browser, sockets, HTTP listeners, services,
startup persistence, unattended access, privilege elevation, clipboard, file
transfer, diagnostics dumps, AV/EDR evasion, Windows prompt bypass, or hidden
session behavior. The preflight SHALL check Windows platform, bounded
PowerShell execution, capture prerequisite assembly/type availability, and input
wrapper compilation readiness. Default success output SHALL be bounded
readiness metadata only. When invoked with `--json`, it SHALL emit bounded
machine-readable readiness metadata containing only `ok`, optional bounded
reason codes, and per-check bounded status records. Failure output SHALL use
bounded reason codes only and MUST NOT echo raw PowerShell output, local file
paths, tokens, pairing codes, credentials, screen contents, input contents,
keystrokes, private reasons, or full secrets.

#### Scenario: Native preflight passes on a prepared Windows host
- **WHEN** a developer runs `npm run mvp:native-preflight` on a Windows machine where the fixed PowerShell prerequisite checks succeed
- **THEN** it reports bounded readiness lines for Windows platform, PowerShell, capture prerequisites, input prerequisites, and read-only safety
- **AND** it exits without starting WinBridge runtime processes, opening network listeners, capturing the screen, applying input, writing files, launching a browser, installing services, configuring startup persistence, elevating privileges, running unattended, or bypassing Windows prompts

#### Scenario: Native preflight emits bounded JSON readiness
- **WHEN** a developer runs `npm run mvp:native-preflight -- --json`
- **THEN** it emits JSON with bounded readiness status and per-check metadata
- **AND** the JSON MUST NOT include raw PowerShell output, scripts, local paths, tokens, pairing codes, credentials, screen contents, input contents, keystrokes, private reasons, raw exceptions, environment values, or full secrets

#### Scenario: Native preflight fails closed
- **WHEN** the platform is not Windows, PowerShell is unavailable, capture prerequisites cannot be loaded, or input prerequisites cannot be compiled
- **THEN** it exits non-zero with a bounded reason code
- **AND** diagnostics MUST NOT expose raw PowerShell output, local paths, tokens, pairing codes, credentials, screen contents, input contents, keystrokes, private reasons, or full secrets

#### Scenario: Native preflight remains read-only
- **WHEN** the native preflight runs its fixed PowerShell checks
- **THEN** those checks MUST NOT call `CopyFromScreen`, call `SendInput`, create input arrays, read clipboard data, read arbitrary files, write files, open sockets, start services, configure startup persistence, launch browsers, elevate privileges, run unattended, evade AV/EDR, or bypass Windows prompts
