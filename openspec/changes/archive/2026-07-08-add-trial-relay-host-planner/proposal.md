## Why

The two-PC trial helper is the shortest operator entrypoint, but it only prints
placeholder relay-host command references. Operators still need to mentally
substitute the relay PC LAN host before asking each machine to print its local
command block, which is an avoidable source of trial setup mistakes.

## What Changes

- Add an optional `--relay-host <host>` plan-mode argument to `mvp:trial`.
- When present, use that validated host only in bounded `mvp:commands -- --only
  ... --relay-host <host> --token-env WINBRIDGE_RELAY_SHARED_TOKEN` command
  references.
- Reject malformed, loopback, unspecified, secret-bearing, duplicated, or
  evidence-mode relay-host arguments.
- Keep plan mode non-executing and continue to avoid printing generated
  session commands, relay URLs, pairing codes, token values, local URLs, audit
  records, frame bytes, screen contents, input contents, or secrets.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: trial workflow planning accepts a validated relay
  host shortcut for concrete role command-reference planning.

## Impact

- Affected code: `scripts/mvp-trial.mjs`, `scripts/mvp-trial.test.ts`,
  `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`, README, and OpenSpec
  artifacts.
- Touches relay and tokens only as non-executing command-reference text.
- Does not add or change capture, input, relay runtime, authorization, audit
  records, installer behavior, startup, services, token values, privilege
  elevation, browser automation, unattended access, hidden sessions, credential
  access, keylogging, clipboard access, AV/EDR evasion, or Windows prompt
  bypass.
- Safety impact: reduces operator setup mistakes while preserving explicit
  consent, host visibility, immediate revoke/disconnect controls, and
  strict post-run audit evidence.
