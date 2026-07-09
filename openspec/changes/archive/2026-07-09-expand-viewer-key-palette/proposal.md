## Why

The development viewer surface can already display frames and send explicit pointer and keyboard input, but the on-screen keyboard is limited to navigation and control keys. A bounded alphanumeric palette makes the two-PC MVP control surface more usable for common remote assistance tasks without introducing typed-text capture, clipboard access, or global keyboard listeners.

## What Changes

- Add explicit on-screen A-Z, 0-9, and Space key buttons to the loopback-only viewer local control surface.
- Route each added key button through the existing same-origin token-protected `/input` path as one `key-down` and one `key-up`.
- Keep existing modifier toggles applying to one explicit key press, then clearing.
- Update focused viewer surface tests and README documentation.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: The viewer local control surface explicitly includes a bounded alphanumeric key palette for MVP browser-based control.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts` and focused tests.
- Affected docs/specs: README and `agent-shell-consent-workflow`.
- Security impact: touches input UX. It does not change authorization, permission gates, audit behavior, relay behavior, capture, native input application, installer, startup, services, logs, tokens, or privilege elevation. It does not add keylogging, typed text buffering, clipboard reads, macros, global keyboard listeners, hidden sessions, or unattended access.
- Non-goals: no production desktop viewer UI, no OS-level keyboard hook, no text-entry buffer, no clipboard sync, no file transfer, no remote shell, no automatic typing, no browser launch, and no change to Windows prompt handling.
