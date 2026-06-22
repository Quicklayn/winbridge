## MODIFIED Requirements

### Requirement: MVP session command kit prints validated visible-session commands

The project SHALL provide a root development command kit that prints relay,
host, viewer, and browser commands for a Windows-to-Windows MVP remote
assistance session. The printed host command SHALL require an explicit host
action to run, keep the session visible, prompt the host interactively before
approval, enable host-side terminal controls after active visible approval,
configure metadata-only audit, opt in to host input application, use a finite
Windows capture stream, and request only currently reviewed permissions. The
printed viewer command SHALL configure metadata-only audit, explicit latest
frame output, and a loopback local control surface. The root agent helper used
by those printed host and viewer commands SHALL build the workspace packages
required by the generated MVP audit, capture, and input workflow before
starting agent-shell.

#### Scenario: Root agent helper builds MVP dependencies

- **WHEN** the command kit prints host and viewer commands that use the root
  `npm run dev:agent` helper
- **THEN** the root helper builds protocol, audit-log, Windows capture, and
  Windows input workspace dependencies before starting agent-shell
- **AND** it MUST NOT start hidden sessions, install services, configure startup
  persistence, elevate privileges, bypass Windows prompts, grant permissions,
  capture the screen, apply input, or open network connections before the user
  explicitly runs the printed command in a visible terminal
