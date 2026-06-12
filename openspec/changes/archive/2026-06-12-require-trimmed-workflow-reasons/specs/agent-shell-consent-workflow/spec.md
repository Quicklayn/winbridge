## ADDED Requirements

### Requirement: Canonical agent-shell workflow reasons
The agent shell SHALL reject CLI and direct runtime workflow reason options when they are blank, oversized, or not already trimmed. Rejection MUST occur before relay connection, socket write, local trusted `sent` event emission, or host workflow simulation, and MUST NOT weaken consent, visibility, authorization, redaction, or fail-closed gates.

#### Scenario: CLI workflow reason is untrimmed
- **WHEN** the agent-shell CLI is started with `--revoke-reason`, `--pause-reason`, `--resume-reason`, or `--terminate-reason` containing leading or trailing whitespace
- **THEN** argument parsing MUST fail before the runtime starts or connects to a relay

#### Scenario: Direct runtime workflow reason is untrimmed
- **WHEN** direct managed runtime options include a workflow reason with leading or trailing whitespace
- **THEN** the runtime MUST reject the options before opening a relay connection or sending any workflow message

#### Scenario: Agent-shell reason rejection is secret-safe
- **WHEN** agent-shell workflow reason validation rejects malformed input
- **THEN** thrown errors, usage output, runtime events, and logs MUST NOT expose raw private reason text, tokens, pairing codes, protocol payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents
