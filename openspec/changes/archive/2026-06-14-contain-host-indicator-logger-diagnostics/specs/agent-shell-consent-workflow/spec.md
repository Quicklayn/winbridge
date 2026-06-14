## ADDED Requirements

### Requirement: Host indicator logger diagnostics are best-effort
The agent shell SHALL treat host indicator logger output as best-effort diagnostics after the local host indicator event has been emitted. A diagnostic logger failure while reporting a host indicator update MUST NOT prevent already-prepared visible authorization workflow from sending active state or workflow audit messages. Host indicator logger failure MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets. Host indicator logger failure MUST NOT grant permissions, approve authorization, change authorization lifecycle state, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Active indicator logger failure is contained
- **WHEN** a host shell explicitly approves an authorization request and emits an active visible host indicator
- **AND** the diagnostic logger fails while reporting the bounded host indicator log line
- **THEN** the logger failure MUST NOT prevent the viewer from receiving active visible authorization state
- **AND** the host shell MUST still send the secret-safe active workflow audit-event
- **AND** the logger failure MUST NOT expose raw logger error text or weaken consent, visibility, authorization, audit, lifecycle, signal, or disconnect boundaries

#### Scenario: Indicator event callback remains authoritative
- **WHEN** host indicator event emission itself fails before the diagnostic logger runs
- **THEN** this change does not require the runtime to continue as if host visibility were successfully rendered
- **AND** that failure MUST NOT be hidden by host indicator logger containment
