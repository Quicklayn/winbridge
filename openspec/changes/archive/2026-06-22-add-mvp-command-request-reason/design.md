# Design: MVP Command Request Reason

## Approach

The command kit adds `--request-reason`, defaulting to a short safe phrase for the generated viewer permission request. The generated viewer command includes:

```text
--request-reason '<reason>'
```

Validation mirrors the existing agent-shell reason boundary for this lightweight command generator:

- value must be a string
- non-blank and already trimmed
- at most 240 UTF-16 code units
- no ASCII control characters
- no Unicode bidirectional or zero-width formatting controls
- no known secret-bearing marker text

The command kit already quotes generated PowerShell arguments, so ordinary spaces are supported.

## Security Rationale

Request reasons are host-facing consent metadata only. They must not authorize access or carry secrets. The existing viewer command still requests explicit permissions, and the host still must approve an active visible session before capture or input can occur.

Rejecting secret-bearing reason text prevents generated commands and consent prompts from accidentally exposing tokens, credentials, pairing codes, authorization headers, screen contents, clipboard contents, file-transfer data, or diagnostics dumps.

## Alternatives Considered

- Leave reason unavailable: safe, but weaker for host consent decisions.
- Hard-code a reason without an option: improves defaults, but blocks local operator wording.
- Import runtime validation directly: avoided because the command generator is intentionally small and non-executing.
