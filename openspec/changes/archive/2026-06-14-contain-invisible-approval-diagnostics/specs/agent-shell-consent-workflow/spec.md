## ADDED Requirements

### Requirement: Invisible approval diagnostic logger failures are best-effort
The agent shell SHALL treat the invisible-approval withheld-active-state diagnostic logger output as best-effort after sending the approval decision and approval workflow audit event. Diagnostic logger failure while reporting that active state was withheld because visible session state is false MUST NOT emit a runtime error event, expose raw logger error text, send active `session-authorization-state`, emit active host indicator state, send active workflow audit, authorize host-originated or viewer-originated `signal`, grant permissions beyond the approved inactive snapshot, start capture, send input, reconnect peers, hide the session from the host, install services, configure startup persistence, elevate privileges, or bypass consent workflows.

#### Scenario: Invisible approval logger failure is contained
- **WHEN** a host runtime approves a valid same-session authorization request while `visibleToHost` is false
- **AND** the diagnostic logger fails while reporting that active state was withheld
- **THEN** the logger failure MUST NOT emit a runtime error event
- **AND** the viewer MAY receive the normal approved decision and approval workflow audit event
- **AND** the viewer MUST NOT receive active `session-authorization-state`
- **AND** the host runtime MUST NOT emit an active host indicator
- **AND** local runtime events and logs MUST NOT expose raw logger error text, raw request reason text, raw protocol payloads, tokens, pairing codes, credentials, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets

#### Scenario: Invisible approval logger failure does not authorize signaling
- **WHEN** invisible approval diagnostic logger failure is contained
- **THEN** the host status MUST remain inactive with `visibleToHost: false`
- **AND** host-originated and viewer-originated `signal` sends MUST remain blocked unless a later unchanged workflow grants active visible `screen:view` authorization
