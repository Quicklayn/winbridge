## ADDED Requirements

### Requirement: Host lifecycle skip diagnostics are best-effort
The agent shell SHALL treat diagnostic logger output emitted after declining ineligible host lifecycle actions as best-effort observability. Ineligible host lifecycle actions include revoke, pause, resume, terminate, expiration, and local disconnect skip paths caused by terminal authorization, expiration, already-paused state, not-paused state, missing granted permission, missing active visible state, missing active-or-paused visible state, or resume delay configured without a pause delay. Diagnostic logger failure in those skip paths MUST NOT emit runtime error events, change authorization lifecycle state, change granted permissions, send `session-control`, send `permission-revoked`, send `session-authorization-state`, send workflow `audit-event` messages, activate or suppress host visibility beyond the already-decided state, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic logger failure MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Terminal lifecycle skip diagnostic logger failure is contained
- **WHEN** a host lifecycle action is skipped because the authorization is already terminal
- **AND** the diagnostic logger fails while reporting the bounded terminal skip diagnostic
- **THEN** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send the skipped lifecycle control, authorization state, permission revocation, or workflow audit messages
- **AND** the logger failure MUST NOT expose raw logger error text or weaken consent, visibility, authorization, audit, lifecycle, signal, or disconnect boundaries

#### Scenario: Resume-without-pause diagnostic logger failure is contained
- **WHEN** a host shell explicitly approves an active visible authorization with a resume delay configured but no pause delay configured
- **AND** the diagnostic logger fails while reporting that resume delay was configured without pause delay
- **THEN** the viewer MUST still observe the active visible authorization state
- **AND** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send pause, resume, permission revocation, termination, expiration, disconnect, or workflow audit messages because of that diagnostic failure
