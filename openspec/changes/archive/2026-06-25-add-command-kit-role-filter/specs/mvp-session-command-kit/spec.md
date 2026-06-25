## ADDED Requirements

### Requirement: MVP command kit filters text output to one fixed target

The MVP command kit SHALL support a text-mode `--only` option with only the
fixed values `relay`, `host`, `viewer`, `browser`, and `preflight`. The option
SHALL render only the selected non-executing command block plus bounded safety
and preflight reminders. For session targets, the filtered output SHALL still
be derived from the same fully validated command plan, including relay URL,
pairing, display names, request reason, token environment references, audit
paths, capture cadence, visible host consent prompt, host controls, viewer
frame output, and loopback viewer surface settings. The option MUST NOT start
relay, host, viewer, browser, capture, input, sockets, HTTP listeners, audit
writes, services, startup persistence, unattended access, privilege elevation,
remote discovery, network probing, firewall changes, hidden sessions, or
Windows prompt bypass behavior.

#### Scenario: Host target prints only host command

- **WHEN** a developer runs `npm run mvp:commands -- --only host`
- **THEN** the helper renders bounded text containing the validated host command
- **AND** it includes manual preflight and host-control reminders
- **AND** it does not render the relay, viewer, or browser command blocks

#### Scenario: Viewer target prints only viewer command

- **WHEN** a developer runs `npm run mvp:commands -- --only viewer`
- **THEN** the helper renders bounded text containing the validated viewer
  command
- **AND** it includes a reminder that the viewer browser block is separate
- **AND** it does not render the relay, host, or browser command blocks

#### Scenario: Browser target prints only browser command

- **WHEN** a developer runs `npm run mvp:commands -- --only browser`
- **THEN** the helper renders bounded text containing only the loopback viewer
  browser command and readiness reminders
- **AND** it does not render relay, host, or viewer runtime commands

#### Scenario: Preflight target prints preflight commands only

- **WHEN** a developer runs `npm run mvp:commands -- --only preflight`
- **THEN** the helper renders the bounded preflight command set
- **AND** it does not render live session commands or browser commands

#### Scenario: Invalid filter fails closed

- **WHEN** a developer supplies an unknown, duplicate, JSON-combined, or
  preflight-only-combined `--only` option
- **THEN** the command kit rejects the input before rendering commands
- **AND** diagnostics remain bounded and do not echo raw unsafe values
