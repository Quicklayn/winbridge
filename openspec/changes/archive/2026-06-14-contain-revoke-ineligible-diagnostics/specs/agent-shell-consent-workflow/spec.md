## ADDED Requirements

### Requirement: Scheduled revoke ineligible diagnostics are best-effort
The agent shell SHALL treat diagnostic logger output emitted while declining ineligible scheduled host revoke configuration as best-effort observability. Ineligible scheduled revoke configuration includes a delayed revoke with no revoke permission configured and a delayed revoke whose configured permission is not included in the active host-approved grant. Diagnostic logger failure in those paths MUST NOT emit runtime error events, undo active visible authorization, change granted permissions, send `session-control`, send `permission-revoked`, send revoked authorization state, send revoke workflow audit messages, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic logger failure MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Out-of-grant scheduled revoke diagnostic logger failure is contained
- **WHEN** a host shell explicitly approves an active visible authorization whose narrowed grant excludes the configured delayed revoke permission
- **AND** the diagnostic logger fails while reporting that the revoke permission was not granted in the active grant
- **THEN** the viewer MUST still observe the active visible authorization state
- **AND** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send revoke control, `permission-revoked`, revoked authorization state, or revoke workflow audit messages
- **AND** the logger failure MUST NOT expose raw logger error text or weaken consent, visibility, authorization, audit, lifecycle, signal, or disconnect boundaries

#### Scenario: Missing scheduled revoke permission diagnostic logger failure is contained
- **WHEN** a host shell explicitly approves an active visible authorization with a delayed revoke configured but no revoke permission configured
- **AND** the diagnostic logger fails while reporting that no revoke permission is configured
- **THEN** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send revoke control, `permission-revoked`, revoked authorization state, or revoke workflow audit messages
- **AND** active authorization, host visibility, and granted permissions MUST remain governed by the host-approved grant
