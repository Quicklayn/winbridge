## ADDED Requirements

### Requirement: Relay startup diagnostics are best-effort
The relay runtime SHALL treat startup warning and listening logs as best-effort diagnostics. Diagnostic logger failures during startup MUST NOT prevent a listener that has already bound and passed mandatory startup audit persistence from remaining started. Startup diagnostic logger failures MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, credentials, private reasons, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets. Startup diagnostic logger failures MUST NOT grant permissions, approve authorization, activate host visibility, start capture, send input, register peers, consume pairing tickets, forward protocol messages, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Development warning logger failure is contained
- **WHEN** the relay starts without a configured shared token
- **AND** the diagnostic logger fails while reporting the bounded development-mode warning
- **THEN** the logger failure MUST NOT reject startup after the listener binds
- **AND** the relay MUST still write the accepted development-mode startup audit record
- **AND** the logger failure MUST NOT expose raw logger error text or weaken relay admission, pairing, forwarding, audit, or consent boundaries

#### Scenario: Listening log failure is contained
- **WHEN** the relay listener has bound successfully and mandatory startup audit persistence has succeeded
- **AND** the diagnostic logger fails while reporting the listening URL log
- **THEN** the logger failure MUST NOT reject startup or close the listener
- **AND** the logger failure MUST NOT expose raw logger error text or weaken relay admission, pairing, forwarding, audit, or consent boundaries
