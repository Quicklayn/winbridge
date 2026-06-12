## Why

The agent shell supports an optional relay token for local/private development relay access. Existing validation rejects blank tokens, but regression coverage does not explicitly prove that a configured relay token stays out of local runtime logs and emitted runtime events during a successful connection.

## What Changes

- Add focused agent-shell integration coverage using a relay configured with a shared token and an agent configured with the matching token.
- Verify connection logs and local runtime event records do not include the raw relay token.
- Keep runtime behavior unchanged unless the test exposes a token leak.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Clarify that relay token use must remain local to connection setup and must not appear in local logs or runtime event records.

## Impact

- Affected code: focused agent-shell runtime integration tests and OpenSpec artifacts.
- Affected systems: local development agent-shell relay connection path.
- Safety impact: strengthens regression protection for token/log hygiene. This does not add capture, input, clipboard sync, file transfer, diagnostics export, installer, startup, service, or privilege behavior.
