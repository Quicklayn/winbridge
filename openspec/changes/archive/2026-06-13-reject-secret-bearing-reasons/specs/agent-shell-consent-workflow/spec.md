## ADDED Requirements

### Requirement: Agent-shell rejects secret-bearing workflow reasons
The agent shell SHALL reject CLI and direct runtime workflow reason options that contain secret-bearing metadata before relay connection, socket write, local trusted `sent` event emission, workflow audit emission, or host workflow simulation. Secret-bearing metadata MUST include raw token, credential, password, passphrase, pairing-code, API-key, authorization-header, auth-header, cookie, private-key, SSH-key, keystroke, screenshot, screen-data, screen-content, clipboard-content, file-transfer content/data/bytes, diagnostics content/dump, or secret markers when they appear with values. Rejection diagnostics, usage output, runtime events, and logs MUST NOT expose the raw reason text.

#### Scenario: CLI workflow reason contains secret-bearing metadata
- **WHEN** the agent-shell CLI is started with `--revoke-reason`, `--pause-reason`, `--resume-reason`, `--terminate-reason`, or `--disconnect-reason` containing secret-bearing metadata
- **THEN** argument parsing fails before the runtime starts or connects to a relay
- **AND** usage handling does not expose the raw reason text

#### Scenario: Direct runtime workflow reason contains secret-bearing metadata
- **WHEN** direct managed runtime options include a decision, revoke, pause, resume, terminate, or disconnect reason containing secret-bearing metadata
- **THEN** the runtime rejects the options before opening a relay connection or sending any workflow message
- **AND** thrown errors, runtime events, and logs do not expose the raw reason text

#### Scenario: Safe agent-shell workflow reason remains accepted
- **WHEN** CLI or direct runtime workflow options use concise non-secret reason text
- **THEN** agent-shell validation accepts the reason when all other consent, visibility, authorization, and role invariants are valid
