## ADDED Requirements

### Requirement: MVP session command kit prints validated visible-session commands

The project SHALL provide a root development command kit that prints relay,
host, viewer, and browser commands for a Windows-to-Windows MVP remote
assistance session. The printed host command SHALL require an explicit host
action to run, keep the session visible, enable host-side terminal controls,
configure metadata-only audit, opt in to host input application, use a finite
Windows capture stream, and request only currently reviewed permissions. The
printed viewer command SHALL configure metadata-only audit, explicit latest
frame output, and a loopback local control surface.

#### Scenario: Commands are generated for a valid MVP session

- **WHEN** a developer runs the command kit with valid session id, pairing code,
  relay URL, audit paths, frame path, viewer surface port, and capture cadence
- **THEN** it prints separate relay, host, viewer, and browser steps
- **AND** the host command includes explicit approval, visible session,
  host controls, local audit, host input opt-in, Windows capture source, and a
  bounded frame stream
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

### Requirement: MVP session command kit fails closed on malformed input

The command kit SHALL validate all configurable values before printing a
command. Malformed values MUST fail closed with bounded usage diagnostics before
printing relay, host, viewer, browser, token, capture, input, audit, process, or
surface commands.

#### Scenario: Malformed command option is rejected

- **WHEN** a developer passes an unknown option, duplicate option, invalid
  session id, invalid pairing code, non-WebSocket relay URL, relay URL with
  embedded credentials or token query, unsafe audit path, unsafe frame path,
  unsafe viewer surface port, unsafe capture count, unsafe capture interval, or
  unsafe capture delay
- **THEN** the command kit exits through bounded usage handling before printing
  any session commands
- **AND** diagnostics MUST NOT echo raw rejected values, tokens, pairing codes,
  credentials, paths containing secrets, screen contents, input contents, or
  full secrets

#### Scenario: Unsafe token handling is rejected

- **WHEN** a developer attempts to pass a raw relay token or an invalid token
  environment variable name to the command kit
- **THEN** the command kit rejects the invocation before printing commands
- **AND** diagnostics MUST NOT echo the raw token value, credentials, pairing
  codes, private reasons, command output, or full secrets

### Requirement: MVP session command kit remains non-executing and development-scoped

The command kit SHALL only format text for a development MVP workflow. It MUST
NOT spawn child processes, open sockets, start HTTP listeners, connect to the
relay, capture the screen, inject input, write audit files, read or write frame
files, install services, configure startup persistence, elevate privileges,
collect credentials, read clipboard data, transfer files, collect diagnostics
dumps, evade AV/EDR, bypass Windows prompts, or keep background handles alive.

#### Scenario: Command kit prints without side effects

- **WHEN** a developer runs the command kit successfully
- **THEN** it prints the command sequence and exits
- **AND** it MUST NOT create a relay connection, start a host, start a viewer,
  start the viewer surface, capture screen frames, apply input, persist audit
  records, write frame bytes, or create background processes

#### Scenario: Command kit failure has no remote side effects

- **WHEN** command kit validation fails
- **THEN** it exits before printing runnable session commands
- **AND** it MUST NOT start capture, send input, reconnect peers, grant
  permissions, suppress host visibility, install persistence, or bypass consent
