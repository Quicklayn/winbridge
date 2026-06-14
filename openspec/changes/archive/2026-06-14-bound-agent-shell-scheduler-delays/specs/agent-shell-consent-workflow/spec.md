## ADDED Requirements

### Requirement: Direct agent-shell scheduler delays are bounded
The agent shell SHALL reject malformed direct scheduler delay values for local host status printing, local viewer status printing, and viewer local disconnect before creating timers. Direct scheduler delay values MUST be finite integer millisecond values from `0` through the safe timer delay bound. Rejection MUST happen before reading status, invoking local viewer leave, invoking host controls, invoking viewer controls, sending public runtime messages, sending protocol messages, emitting workflow audit events, or writing prompt output.

#### Scenario: Host status scheduler rejects malformed delay
- **WHEN** local code schedules a host status print with a negative, fractional, non-finite, `NaN`, or timer-unsafe delay value
- **THEN** the scheduler rejects the request before creating a status timer
- **AND** the rejection MUST NOT call `getHostStatus`, call viewer status, invoke host controls, send public runtime messages, write host status output, or bypass consent workflows

#### Scenario: Viewer status scheduler rejects malformed delay
- **WHEN** local code schedules a viewer status print with a negative, fractional, non-finite, `NaN`, or timer-unsafe delay value
- **THEN** the scheduler rejects the request before creating a status timer
- **AND** the rejection MUST NOT call `getViewerStatus`, call host status, invoke host controls, invoke viewer controls, send public runtime messages, write viewer status output, or bypass consent workflows

#### Scenario: Viewer local disconnect scheduler rejects malformed delay
- **WHEN** local code schedules viewer local disconnect with a negative, fractional, non-finite, `NaN`, or timer-unsafe delay value
- **THEN** the scheduler rejects the request before creating a disconnect timer
- **AND** the rejection MUST NOT call local viewer leave, invoke host controls, invoke viewer controls, send public runtime messages, write disconnect output, reconnect peers, or bypass consent workflows

#### Scenario: Valid direct zero-delay scheduling remains supported
- **WHEN** local code schedules host status print, viewer status print, or viewer local disconnect with `delayMs=0`
- **THEN** the scheduler keeps the existing zero-delay behavior
- **AND** zero-delay scheduling MUST NOT grant permissions, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows
