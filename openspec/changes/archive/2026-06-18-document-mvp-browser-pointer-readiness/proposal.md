## Why

The MVP command kit opens the loopback viewer surface, but the generated output
does not tell the developer to wait for `frame=ready` or to use the visible
`Pointer Off/On` control before browser pointer actions can send input. After
frame-ready pointer gating, that missing instruction can make the MVP workflow
look broken even though it is intentionally fail-closed.

## What Changes

- Add a browser-step note to the printed MVP command sequence.
- State that the viewer should wait for `frame=ready` before pointer control.
- State that browser pointer actions require the visible `Pointer Off/On`
  control and remain disabled during loading/not-ready frames.
- Keep the command kit non-executing and side-effect free.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: generated browser step includes pointer readiness
  guidance for the loopback viewer surface.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs` and focused tests.
- Affected specs/docs: `mvp-session-command-kit` spec and README command kit
  description.
- APIs/dependencies: no protocol, relay, runtime API, CLI flag, native Windows,
  or dependency changes.
- Safety impact: clarifies fail-closed pointer behavior. It does not start
  processes, capture, inject input, install persistence, hide sessions, bypass
  prompts, or add authorization behavior.
