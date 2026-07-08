## ADDED Requirements

### Requirement: MVP LAN probe verifies relay pairing readiness

The project SHALL provide a root `npm run mvp:lan-probe` helper that performs
a bounded live relay/session reachability probe for a two-PC MVP trial before
authorization, capture, input, browser, or audit evidence workflows are
started. The helper MUST require an explicit `--role host|viewer`, relay URL,
session id, pairing code, peer id, device id, and bounded timeout. It MUST
connect one operator-run peer to the relay, send only a schema-valid
`join-session` envelope for that role, wait until the relay reports paired room
readiness for the local peer, close its own socket, and exit. It MUST support a
shared relay token only through `--token-env <ENV_NAME>` and MUST read only that
environment variable value without printing it. The helper MUST support bounded
text output and bounded JSON output with fixed check names and reason codes.

The helper MUST fail closed on malformed or duplicate arguments, unsafe relay
URLs, missing token environment values, token denial, wrong pairing, relay
errors, timeout, socket close before readiness, or unexpected protocol messages.
Diagnostics MUST NOT echo raw relay URLs, token values, token environment
values, pairing codes, protocol payloads, WebSocket close reasons, exception
messages, stdout, stderr, child output, credentials, local file paths, frame
bytes, screen contents, input contents, clipboard contents, diagnostics dumps,
or full secrets.

The helper MUST NOT send `hello`, host consent, authorization, signal,
screen-frame, input-event, session-control, permission revocation, audit-event,
clipboard, file-transfer, diagnostics, service, startup, persistence,
privilege, browser, or local-control messages. It MUST NOT approve sessions,
grant permissions, activate host visibility, start capture, apply input, open
HTTP listeners, launch browsers, install services, configure startup
persistence, run unattended, elevate privileges, perform firewall changes,
evade AV/EDR, bypass Windows prompts, or hide sessions.

#### Scenario: Opposite roles reach paired readiness

- **WHEN** a host probe and a viewer probe connect to the same relay with the
  same session id and pairing code before their bounded timeouts expire
- **THEN** each helper observes relay readiness for its local peer with a
  paired room
- **AND** each exits successfully after closing its own socket
- **AND** output reports only bounded probe status metadata

#### Scenario: Probe fails closed on missing peer

- **WHEN** a single host or viewer probe connects but the opposite role does
  not join before the bounded timeout
- **THEN** the helper exits non-zero with a fixed timeout reason
- **AND** output does not include relay URLs, pairing codes, tokens, close
  reasons, protocol payloads, stdout, stderr, or secrets

#### Scenario: Probe fails closed on malformed or unauthorized setup

- **WHEN** a developer supplies malformed arguments, an unsafe relay URL, a
  missing token environment variable, a rejected token, or a wrong pairing code
- **THEN** the helper exits non-zero before reporting paired readiness
- **AND** diagnostics remain bounded and secret-safe

#### Scenario: Probe remains non-authorizing

- **WHEN** the LAN probe succeeds
- **THEN** it has sent only a join message and consumed relay readiness
- **AND** it has not requested consent, granted authorization, activated host
  visibility, sent frames, sent input, written audit records, started control
  surfaces, opened a browser, or changed Windows state
