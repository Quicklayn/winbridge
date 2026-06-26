# Design: Token-env role readiness validation

## Context
`npm run mvp:ready` validates the aggregate token command plan with a fixed environment variable name, while `--role host` and `--role viewer` currently validate localhost and LAN role-filtered command output only. A user can therefore pass local role readiness while the token-env shape in role-filtered host/viewer output has drifted.

## Approach
- Add host and viewer role-scoped checks that run `mvp:commands -- --only <role> --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
- Validate that the output remains role-specific and contains only the expected environment-variable token reference, not a raw token value.
- Keep output formatting bounded to check names and status only.
- Keep relay role readiness unchanged because relay shared-token behavior is already represented by the relay environment setup in the aggregate command plan and relay role gate is scoped to relay launch readiness.

## Security Review
The change touches command text validation and token-reference safety. It preserves the existing raw-token prohibition: validation requires an environment variable reference and never echoes command text, child output, relay URLs, local paths, pairing codes, token names, token values, or stdout/stderr in readiness output.
