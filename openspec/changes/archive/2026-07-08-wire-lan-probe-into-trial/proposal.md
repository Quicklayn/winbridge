## Why

`mvp:lan-probe` exists, but the two-PC trial helper does not yet guide
operators to run it before the full host/viewer assistance commands. The probe
also requires a full relay URL, while the rest of the MVP command workflow uses
the safer `--relay-host` shortcut to avoid manual URL construction mistakes.

## What Changes

- Add a bounded `--relay-host <host>` shortcut to `mvp:lan-probe`, mutually
  exclusive with `--relay`.
- Add fixed host and viewer LAN probe command-reference steps to `mvp:trial`
  plan output.
- Preserve trial output bounds by using placeholders for session and pairing
  metadata and by avoiding generated relay URLs, concrete pairing codes, token
  values, local URLs, frame paths, or command output.
- Extend `mvp:ready` trial-plan validation to accept the reviewed probe steps.
- Extend `mvp:doctor` script and entrypoint alignment to cover
  `mvp:lan-probe`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: LAN probe and two-PC trial workflow become aligned
  around the reviewed relay-host shortcut.

## Impact

- Affected code: `scripts/mvp-lan-probe.mjs`,
  `scripts/mvp-lan-probe.test.ts`, `scripts/mvp-trial.mjs`,
  `scripts/mvp-trial.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, `scripts/mvp-doctor.mjs`,
  `scripts/mvp-doctor.test.ts`, README, and OpenSpec artifacts.
- Touches relay and token setup only as bounded probe connection setup and
  non-executing trial command references.
- Does not change relay runtime admission, authorization, capture, input, audit
  persistence, installer behavior, startup, services, privilege elevation,
  browser automation, unattended access, hidden sessions, credential access,
  keylogging, clipboard access, AV/EDR evasion, or Windows prompt bypass.
