## Why

`mvp:smoke` already proves the happy-path viewer surface can serve a frame and
accept bounded input after explicit visible host authorization. It should also
prove that the same local surface rejects unsafe mutation requests before a
two-PC MVP trial, because token, origin, and content-type gates are core abuse
resistance for the loopback control surface.

## What Changes

- Add a smoke subcheck that posts fixed negative requests to the loopback
  viewer surface `/input` endpoint with a missing mutation token, a foreign
  origin, and an unsafe content type.
- Require each negative request to fail closed while the authorized happy path
  remains unchanged.
- Keep smoke output bounded to fixed subcheck names and safe reason codes,
  without echoing mutation tokens, origins, commands, URLs, ports, response
  bodies, child output, or protocol metadata.
- Document that `mvp:smoke` verifies both accepted input and guarded local
  mutation denial.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: smoke helper verifies fixed local viewer surface
  mutation guard denials for the development MVP workflow.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-session-smoke.test.ts`, README, and OpenSpec docs.
- Affected systems: local smoke helper and loopback viewer surface probing
  only.
- Safety impact: touches local input guard verification but does not weaken or
  replace runtime authorization. No capture, relay protocol, production auth,
  installer, startup, service, privilege, native Windows API, or audit write
  behavior changes.
- Non-goals: no new remote control endpoint, no browser automation, no network
  discovery, no firewall changes, no unattended access, no hidden sessions, no
  credential access, no keylogging, no AV/EDR evasion, and no Windows prompt
  bypass.
