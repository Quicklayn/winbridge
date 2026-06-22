## Why

The MVP viewer surface can already send free-form keyboard commands through the
command box, but common remote-assistance actions such as Enter, Escape, Tab,
Backspace, and arrow navigation require manual command syntax. Explicit
same-page keyboard buttons make the development MVP easier to use while keeping
input intentional and visible.

## What Changes

- Add a small set of explicit on-screen keyboard buttons to the loopback-only
  viewer local control surface.
- Each button sends one `key-down` and one `key-up` command through the existing
  `/input` endpoint, mutation token, viewer status gate, runtime
  `sendInputEvent()` path, audit-before-send, and permission checks.
- Keep the existing command box for advanced manual input commands.
- Do not add document-level keyboard capture, text buffering, macros, clipboard,
  file transfer, diagnostics, background listeners, persistence, elevation, or
  Windows prompt bypass.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Extend the local viewer surface requirement
  so explicit same-page keyboard buttons may send one bounded key press through
  the existing consent-bound input path.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts` and
  focused local surface tests.
- Affected docs/specs: `openspec/specs/agent-shell-consent-workflow/spec.md`
  after archive, plus README/security docs if user-facing descriptions need the
  new controls.
- Security impact: touches viewer input UI only. It does not change host
  consent, host visibility, authorization, native input application gates,
  relay behavior, audit semantics, installer behavior, startup behavior,
  services, tokens, logs beyond existing metadata-only responses, or privilege
  elevation.
