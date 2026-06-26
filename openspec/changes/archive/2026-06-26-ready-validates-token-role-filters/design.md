# Design: Default token-env role-filter validation

## Context
`npm run mvp:ready` is the main preflight gate operators run before a two-PC trial. It already validates a token-env full command plan in JSON mode. However, the operator-facing role-filter text output for `--only host` and `--only viewer` can be rendered separately with `--token-env`, and the default gate does not currently validate those text blocks.

## Approach
- Add two default ready plan steps after the ordinary role-filter text checks:
  - `token-role-filter-host-command`
  - `token-role-filter-viewer-command`
- Run the command kit in text mode with `--only <role> --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
- Reuse `parseTokenEnvAgentRoleFilteredCommandReadiness` so validation requires the correct role block and the fixed `$env:WINBRIDGE_RELAY_SHARED_TOKEN` reference.
- Keep readiness output limited to fixed check names and status.

## Security Rationale
The validator checks for an environment-variable reference, not a raw token value. Generated command text, token references, relay URLs, pairing codes, local paths, stdout, stderr, and child output remain internal and are not emitted in success or failure output.
