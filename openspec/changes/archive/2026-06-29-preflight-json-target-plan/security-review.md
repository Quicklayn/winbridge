# Security Review

Reviewed scope: command-kit parsing/rendering and `mvp:ready` validation for
`mvp:commands -- --only preflight --json`.

Findings:

- The new path renders only the existing bounded preflight JSON command plan.
  It does not start relay, host, viewer, browser, smoke, capture, input,
  sockets, HTTP listeners, services, startup persistence, unattended access, or
  privileged actions.
- JSON role-filter output remains rejected for runtime targets: relay, host,
  viewer, and browser.
- The preflight JSON plan contains fixed command names and bounded static
  command strings only. It does not read token values, relay output, generated
  child output, frame bytes, input payloads, clipboard contents, files, or
  diagnostics.
- `mvp:ready` validates the preflight JSON target with a fixed fail-closed
  parser and reports only bounded step metadata.
- No hidden sessions, stealth persistence, credential access, keylogging,
  AV/EDR evasion, Windows prompt bypass, clipboard, file transfer, diagnostics,
  or remote shell paths were added.

Residual risk:

- Local automation can now consume the preflight target in JSON form, but it
  still receives commands to run manually rather than an execution plan runner.
