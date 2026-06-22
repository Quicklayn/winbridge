## Why

The MVP command kit already prints visible relay, host, viewer, and browser
steps, but the browser step is only a bare URL. A Windows MVP operator should be
able to copy each printed step into a visible PowerShell terminal consistently,
including opening the loopback viewer surface.

## What Changes

- Print the browser step as a visible PowerShell `Start-Process '<url>'`
  command.
- Keep the local loopback URL visible in the generated output for inspection.
- Keep the command kit non-executing: it still only formats text and does not
  launch a browser or start any background process.
- Update tests, specs, and docs for the browser-open command.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: Browser step output becomes a runnable visible
  PowerShell command for the existing loopback viewer surface URL.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs`, focused command-kit tests.
- Affected docs/specs: README and OpenSpec MVP command-kit spec.
- APIs: no protocol, relay, agent-shell runtime, capture, input, auth, or audit
  API changes.
- Dependencies: no new runtime dependency.
- Safety impact: command formatting only. It does not spawn a browser, open
  sockets, start capture, apply input, add hidden sessions, install persistence,
  elevate privileges, collect credentials, keylog, evade AV/EDR, bypass Windows
  prompts, or change authorization.
