## MODIFIED Requirements

### Requirement: MVP session command kit prints validated visible-session commands

The project SHALL provide a root development command kit that prints relay,
host, viewer, and browser commands for a Windows-to-Windows MVP remote
assistance session. The printed relay command SHALL use a root helper that
builds the workspace packages required by the development relay before starting
relay. The printed host command SHALL require an explicit host action to run,
keep the session visible, prompt the host interactively before approval, enable
host-side terminal controls after active visible approval, configure
metadata-only audit, opt in to host input application, use a finite Windows
capture stream, and request only currently reviewed permissions. The printed
viewer command SHALL configure metadata-only audit, explicit latest frame
output, and a loopback local control surface. The default printed local audit
and latest-frame paths SHALL be backed by runtime sinks that create safe parent
directories on first authorized write, so a fresh checkout does not require
manual `logs` or `frames` directory setup before the developer runs the printed
commands. The root agent helper used by those printed host and viewer commands
SHALL build the workspace packages required by the generated MVP audit,
capture, and input workflow before starting agent-shell.

#### Scenario: Root relay helper builds MVP dependencies

- **WHEN** the command kit prints the relay command that uses the root
  `npm run dev:relay` helper
- **THEN** the root helper builds protocol and audit-log workspace dependencies
  before starting relay
- **AND** it MUST NOT start hidden sessions, install services, configure startup
  persistence, elevate privileges, bypass Windows prompts, grant permissions,
  capture the screen, apply input, or open network connections before the user
  explicitly runs the printed command in a visible terminal

#### Scenario: Default local artifact directories are created by runtime sinks

- **WHEN** a developer runs the printed host or viewer commands from a fresh
  checkout without pre-creating `logs` or `frames`
- **THEN** the configured audit sinks create safe audit parent directories on
  first metadata-only audit write
- **AND** the configured viewer latest-frame output sink creates the safe frame
  parent directory before publishing the first authorized latest-frame file
- **AND** failures to create or write those local artifacts remain visible
  runtime failures instead of being silently ignored
