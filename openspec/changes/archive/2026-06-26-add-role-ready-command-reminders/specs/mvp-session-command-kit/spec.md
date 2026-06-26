## ADDED Requirements

### Requirement: Role-filtered command output includes role-scoped ready reminders

The MVP command kit SHALL include a local role-scoped readiness reminder in
filtered text output for relay, host, viewer, and browser targets. Relay output
MUST remind the operator to run `npm run mvp:ready -- --role relay` on the relay
machine. Host output MUST remind the operator to run
`npm run mvp:ready -- --role host` on the host machine. Viewer output MUST
remind the operator to run `npm run mvp:ready -- --role viewer` on the viewer
machine. Browser output MUST use the viewer role reminder because the browser
surface runs on the viewer machine. The reminder MUST remain non-executing
text and MUST NOT start relay, host, viewer, browser, capture, input, socket,
HTTP, service, startup, unattended, privilege, credential, clipboard, file
transfer, diagnostics, AV/EDR evasion, Windows prompt bypass, or hidden-session
behavior.

#### Scenario: Filtered command reminders match the selected local role

- **WHEN** a developer renders `mvp:commands -- --only relay`, `host`,
  `viewer`, or `browser`
- **THEN** the selected text block includes the matching role-scoped
  `mvp:ready -- --role ...` reminder for the local machine
- **AND** the browser target uses the viewer role reminder
- **AND** the helper still only prints text and exits

#### Scenario: Ready validation requires the bounded role reminder

- **WHEN** `npm run mvp:ready` validates fixed role-filtered command output
- **THEN** each relay, host, viewer, and browser role-filter check requires the
  expected role-scoped reminder
- **AND** readiness output MUST NOT echo generated command strings, relay URLs,
  local URLs, local paths, pairing codes, tokens, token environment values,
  stdout, stderr, child output, credentials, screen contents, input contents,
  or full secrets
