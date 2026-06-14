## Why

The development host consent prompt currently shows the viewer peer id and display name, but it does not surface the already validated local device identity that peers provide at join time. Showing bounded device identity metadata gives the host operator better context before approve/deny while staying within the consent-first remote assistance boundary.

## What Changes

- Extend `hello` peer metadata to optionally carry the sender's schema-validated `deviceIdentity`.
- Require `hello.deviceIdentity.displayName` to match the top-level `hello.displayName` when present, avoiding conflicting identity text.
- Track trusted viewer device metadata in the agent shell after receiving a valid opposite-role `hello`.
- Pass bounded viewer device id and platform into the interactive host consent prompt.
- Do not render self-asserted remote `deviceIdentity.trustLevel` in host consent prompts until a future authenticated trust decision exists.
- Render unsafe or missing optional device metadata as unavailable instead of echoing raw values.
- Non-goals: no screen capture, remote input, clipboard, file transfer, diagnostics dump, reconnect, hidden session, stealth persistence, credential access, Windows prompt bypass, relay authorization change, token change, installer change, service change, startup behavior, or privilege elevation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: `hello` peer metadata may include bounded device identity, with consistency validation against the top-level display name.
- `agent-shell-consent-workflow`: interactive host consent prompt receives and renders bounded viewer device id/platform metadata as non-authorizing context.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, protocol tests, `apps/agent-shell/src/runtime.ts`, host consent prompt tests, runtime integration tests, and documentation.
- API impact: `HelloMessageSchema` accepts optional `deviceIdentity`; `HostDecisionProviderRequest` gains optional bounded viewer device id/platform fields.
- Safety impact: this touches user-visible host consent context and identity metadata only. It does not grant permissions, approve authorization, activate host visibility, start signaling, capture the screen, send input, or bypass consent workflows.
