## ADDED Requirements

### Requirement: Pause and resume state updates
The protocol SHALL represent host pause and resume as explicit session control messages paired with authorization state updates.

#### Scenario: Host pauses authorization
- **WHEN** the host pauses a visible active authorization
- **THEN** it sends `session-control` with action `pause` and sends `session-authorization-state` with status `paused`, `visibleToHost` set to true, and the current permission list

#### Scenario: Host resumes authorization
- **WHEN** the host resumes a paused visible unexpired authorization
- **THEN** it sends `session-control` with action `resume` and sends `session-authorization-state` with status `active`, `visibleToHost` set to true, and the current permission list

#### Scenario: Pause and resume are not remote action grants
- **WHEN** pause or resume protocol messages are sent
- **THEN** they do not authorize screen capture, input, clipboard, file transfer, diagnostics, or any other sensitive action unless the resulting authorization state is active, visible, unexpired, and scoped to the requested permission
