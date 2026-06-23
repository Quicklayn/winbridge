## Why

The MVP browser viewer surface can send a few explicit key presses, but it cannot combine those keys with common modifiers without falling back to the manual command box. Adding visible modifier toggles improves practical remote-control ergonomics while preserving the current no-keylogging and no-text-buffer safety model.

## What Changes

- Add explicit `Shift`, `Ctrl`, `Alt`, and `Meta` modifier toggles to the loopback-only viewer local control surface.
- Apply selected modifiers only to the next explicit keyboard button press.
- Keep all keyboard input user-initiated through visible controls; do not install document-level keyboard listeners or buffer typed text.
- Preserve existing local mutation token, same-origin, active authorization, and bounded diagnostics gates.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: the viewer local control surface gains explicit bounded modifier toggles for existing keyboard buttons.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts` and its focused tests.
- Affected user workflow: viewer browser control surface keyboard buttons.
- Security impact: touches remote input UI only; no capture, auth, relay, installer, startup, service, token, log, or privilege-elevation changes. Input still requires host consent, visible active authorization, local same-origin token validation, and runtime permission checks.
