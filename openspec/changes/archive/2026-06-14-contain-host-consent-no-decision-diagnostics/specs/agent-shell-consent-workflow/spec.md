## ADDED Requirements

### Requirement: Interactive host consent no-decision diagnostics are best-effort
The agent shell SHALL treat diagnostic logger output emitted after interactive host consent timeout or invalid/no-accepted-decision outcomes as best-effort observability. Diagnostic logger failure in those no-decision paths MUST NOT emit runtime error events, send `session-authorization-decision`, send `session-authorization-state`, send `session-control`, send `permission-revoked`, send `signal`, send workflow `audit-event` messages, grant permissions, activate the host indicator, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows. Diagnostic logger failure MUST NOT expose raw logger error text, tokens, pairing codes, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Invalid consent diagnostic logger failure is contained
- **WHEN** an interactive host consent provider returns anything other than an accepted approval or denial response
- **AND** the diagnostic logger fails while reporting that interactive host consent returned no accepted decision
- **THEN** the host runtime MUST keep the authorization request unapproved
- **AND** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send authorization decision, authorization state, lifecycle control, permission revocation, signal, or workflow audit messages
- **AND** the logger failure MUST NOT expose raw logger error text or weaken consent, visibility, authorization, audit, lifecycle, signal, or disconnect boundaries

#### Scenario: Consent timeout diagnostic logger failure is contained
- **WHEN** an interactive host consent provider times out before returning an accepted approval or denial response
- **AND** the diagnostic logger fails while reporting the bounded timeout diagnostic
- **THEN** the host runtime MUST keep the authorization request unapproved
- **AND** the host shell MUST NOT emit a runtime error because of the logger failure
- **AND** the runtime MUST NOT send authorization decision, authorization state, lifecycle control, permission revocation, signal, or workflow audit messages
- **AND** active permissions and host visibility MUST remain unavailable unless a later unchanged workflow explicitly approves a new authorization request visibly
