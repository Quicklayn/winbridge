## Why

Interactive control prompts already reject malformed commands without echoing input, but they do not explicitly bound command line length before parsing and dispatch. A small local limit reduces accidental or hostile oversized stdin handling while keeping the development prompt behavior simple and secret-safe.

## What Changes

- Add a finite command-line length bound for interactive host and viewer control prompts.
- Reject overlong host/viewer prompt lines before command parsing, status reads, local disconnect, lifecycle controls, public sends, or protocol construction.
- Keep rejection output generic and secret-safe; do not echo the raw line or include byte contents.
- No relay, authorization, reconnect, capture, input, clipboard, file-transfer, diagnostics, native Windows, installer, service, startup, token, log-persistence, or privilege behavior is introduced.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add bounded local command-line length handling for interactive host and viewer control prompts.

## Impact

- Affected code: `apps/agent-shell/src/host-control-prompt.ts`, `apps/agent-shell/src/viewer-control-prompt.ts`, and their focused tests.
- Affected behavior: local development prompt input validation only.
- Safety impact: improves local prompt abuse resistance while preserving consent, visibility, revocation, and fail-closed runtime gates.
- Touch areas: local prompt command parsing and local prompt diagnostics. This does not touch screen capture, input execution, relay routing, reconnect, authorization semantics, installer behavior, startup persistence, services, tokens, audit persistence, privilege elevation, Windows prompts, or native Windows APIs.
