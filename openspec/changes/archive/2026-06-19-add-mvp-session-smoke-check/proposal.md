## Why

The MVP flow now has enough pieces to connect a relay, host, viewer, frame
output, and loopback viewer surface, but the repository lacks one bounded
command that proves those pieces still work together before a manual two-PC
Windows trial. A local smoke check reduces MVP regression risk without adding a
new remote capability.

## What Changes

- Add a root `mvp:smoke` helper that starts a short local development relay,
  host, and viewer session with static frame output.
- Verify that consent-bound authorization reaches the viewer, the latest-frame
  file is published, and the loopback viewer surface returns the HTML and frame
  endpoint expected by the browser workflow.
- Shut down all child processes after success, failure, timeout, or interrupt.
- Add focused tests and README/docs guidance for the smoke check.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: add a bounded executable smoke check for the local
  static-frame MVP workflow.

## Impact

- Affected code: root package scripts and a new script under `scripts/`.
- Affected docs/specs: README and `mvp-session-command-kit`.
- APIs/dependencies: no runtime API, protocol, relay, native Windows, or
  dependency changes.
- Safety impact: touches relay/auth/log tooling only by starting the existing
  development CLI processes in a local bounded smoke run. It does not add
  Windows capture, OS input application, unattended access, persistence,
  services, credential access, keylogging, AV/EDR evasion, Windows prompt
  bypass, or hidden sessions.
