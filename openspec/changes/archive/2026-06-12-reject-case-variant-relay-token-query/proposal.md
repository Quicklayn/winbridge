## Why

Relay shared-token handling already requires the canonical `token` query parameter, but URL query names are parsed case-sensitively in the current implementation. Case-variant names such as `Token` or `TOKEN` can therefore create ambiguous token-bearing URLs, especially when the development relay is running without a configured shared token.

## What Changes

- Require relay clients to use only the canonical lowercase `token` query parameter name for development shared-token authentication.
- Treat any query parameter whose name case-insensitively equals `token` but is not exactly `token` as token-bearing and invalid.
- Reject agent-shell `--relay` and managed runtime relay URLs that contain canonical or case-variant `token` query parameters; shared tokens must use `--token` or the runtime `token` option.
- Preserve existing bounded audit behavior: raw configured or presented token values are not logged, forwarded, echoed, or audited.
- Non-goals: no production identity system, no native capture/input implementation, no installer/startup/service changes, and no hidden or unattended access.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-broker`: Clarify canonical relay shared-token query handling and rejection of case-variant token parameter names.
- `agent-shell-consent-workflow`: Clarify relay URL validation for CLI and managed runtime token query parameters.

## Impact

- Affected areas: `apps/relay`, `apps/agent-shell`, relay/agent tests, README, security model, architecture docs, and OpenSpec specs.
- Touches relay, tokens, auth-adjacent development access checks, and audit/log safety. It does not touch screen capture, remote input, installer behavior, services, startup, persistence, privilege elevation, or Windows security prompts.
