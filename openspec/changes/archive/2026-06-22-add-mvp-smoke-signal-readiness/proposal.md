## Why

The MVP command kit now prints a bounded development signal probe and host
acknowledgement path, but the root smoke check still validates only relay,
frame, surface, and local input readiness. MVP preflight should exercise the
same consent-bound signal readiness metadata before a two-PC trial.

## What Changes

- Enable the static host signal acknowledgement and bounded viewer signal
  probe in the local MVP smoke plan.
- Make the smoke check wait for the loopback viewer `/status` endpoint to
  report `signalProbeAckReceived=true` before marking the run successful.
- Add bounded success and failure metadata for the new signal readiness check.
- Document that the smoke check verifies signal readiness without printing raw
  signal payloads or granting new capability.

## Impact

- Affected specs: `mvp-session-command-kit`
- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-session-smoke.test.ts`, `README.md`
- Safety: development-only local preflight; no hidden sessions, unattended
  access, Windows capture, OS input application, browser automation, services,
  startup persistence, privilege elevation, credential access, or Windows prompt
  bypass.
