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
frame output, and a loopback local control surface.

#### Scenario: Commands are generated for a valid MVP session

- **WHEN** a developer runs the command kit with valid session id, pairing code,
  relay URL, audit paths, frame path, viewer surface port, and capture cadence
- **THEN** it prints separate relay, host, viewer, and browser steps
- **AND** the host command includes interactive host consent prompt, visible
  session, delayed host controls, local audit, host input opt-in, Windows
  capture source, and a bounded frame stream
- **AND** the viewer command includes screen and input permissions, local audit,
  explicit latest-frame output, and a `127.0.0.1` viewer control surface URL

#### Scenario: Generated workflow keeps host revocation visible

- **WHEN** the command kit prints the host step
- **THEN** the output includes host terminal controls for pausing, resuming,
  revoking permissions, terminating authorization, and disconnecting
- **AND** it MUST NOT describe or create hidden sessions, unattended access,
  startup persistence, service installation, privilege elevation, Windows prompt
  bypass, clipboard access, file transfer, diagnostics collection, keylogging,
  credential collection, AV/EDR evasion, or a remote shell
