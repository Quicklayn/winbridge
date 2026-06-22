## ADDED Requirements

### Requirement: Agent shell CLI signal shutdown is idempotent

The agent shell CLI SHALL handle SIGINT and SIGTERM through a single
idempotent shutdown path. After the first handled signal, the CLI MUST stop
local prompt, status, viewer surface, disconnect, remote interaction, and
managed runtime handles through the existing shutdown ordering before exiting.
Additional SIGINT or SIGTERM events while shutdown is in progress or complete
MUST NOT start a second cleanup attempt, send protocol messages, reconnect
peers, grant permissions, keep local listeners alive, expose secrets, hide the
host active-session indicator, or bypass consent.

#### Scenario: Signal shutdown succeeds once

- **WHEN** the agent shell CLI receives SIGINT or SIGTERM
- **THEN** it starts the existing local shutdown sequence at most once
- **AND** successful cleanup exits with code `0`

#### Scenario: Signal shutdown fails closed

- **WHEN** the existing local shutdown sequence rejects during signal handling
- **THEN** the CLI reports the failure through bounded agent-shell diagnostics
- **AND** it exits with code `1`
- **AND** later signals MUST NOT start another cleanup attempt or expose raw
  tokens, pairing codes, credentials, private reasons, screen contents, input
  contents, clipboard contents, file-transfer contents, or diagnostics dumps
