# Design: MVP Command Display Names

## Approach

The command kit adds two string options:

- `--host-name`
- `--viewer-name`

Defaults are explicit, safe development labels. Generated host and viewer commands include the matching agent-shell `--name` option. The viewer name is the important host-facing consent prompt metadata; host name still improves local log and relay readability.

Validation mirrors the agent-shell display-name boundary closely enough for this non-importing command generator:

- value must be a string
- non-blank and already trimmed
- at most 120 UTF-16 code units
- no ASCII control characters
- no Unicode bidirectional or zero-width formatting controls
- no known secret-bearing marker text

The command kit already quotes generated PowerShell arguments, so display names containing ordinary spaces remain supported.

## Security Rationale

Display names are metadata only and must never become authentication. The generated command plan continues to rely on existing consent, visibility, permission, audit, and revocation gates. Rejecting secret-bearing values prevents command output, logs, and host prompts from becoming accidental token or credential carriers.

## Alternatives Considered

- Keep process-id defaults: technically functional, but poor consent ergonomics for MVP trials.
- Add device ids in the command kit too: useful later, but display names are the smallest immediate host-consent improvement.
- Import protocol validation directly into the script: avoided because the command generator intentionally stays lightweight and non-executing.
