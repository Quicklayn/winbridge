## MODIFIED Requirements

### Requirement: MVP session command kit prints validated visible-session commands

The project SHALL provide a root development command kit that prints preflight,
relay, host, viewer, and browser commands for a Windows-to-Windows MVP remote
assistance session. The printed preflight section SHALL instruct the developer
to run the root MVP doctor on each Windows machine and the root MVP smoke check
as a local static preflight before starting the two-PC trial. The printed relay
address guidance SHALL show the validated relay URL, state that `localhost`
relay URLs are only for same-machine trials, and instruct two-PC users to rerun
the command kit with an explicit LAN IP or DNS relay URL for the relay PC. The
printed relay command SHALL use a root helper that builds the workspace
packages required by the development relay before starting relay. The printed
host command SHALL require an explicit host action to run, keep the session
visible, prompt the host interactively before approval, enable host-side
terminal controls after active visible approval, configure metadata-only audit,
opt in to host input application, use a finite Windows capture stream, and
request only currently reviewed permissions. The printed viewer command SHALL
configure metadata-only audit, explicit latest frame output, and a loopback
local control surface. The printed browser step SHALL be a visible PowerShell
command that opens the already validated loopback viewer surface URL on the
viewer PC when the developer explicitly runs it, while keeping that loopback
URL inspectable in the generated output. The printed browser step SHALL include
bounded static guidance that browser pointer actions require `frame=ready` and
the visible `Pointer Off/On` control before pointer input can be sent. The
default printed local audit and latest-frame paths SHALL be backed by runtime
sinks that create safe parent directories on first authorized write, so a fresh
checkout does not require manual `logs` or `frames` directory setup before the
developer runs the printed commands. The root agent helper used by those
printed host and viewer commands SHALL build the workspace packages required by
the generated MVP audit, capture, and input workflow before starting
agent-shell.

#### Scenario: Relay address guidance is printed without probing
- **WHEN** the command kit prints the MVP workflow
- **THEN** it prints the validated relay URL before the relay, host, viewer, and browser commands
- **AND** it warns that `localhost` is only for same-machine trials
- **AND** it instructs two-PC users to rerun the command kit with an explicit LAN IP or DNS relay URL
- **AND** the command kit itself MUST NOT probe network interfaces, resolve DNS, start relay, host, viewer, browser, capture, input, socket, HTTP, service, startup persistence, privilege, unattended, or Windows prompt actions
