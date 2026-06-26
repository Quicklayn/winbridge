## Why

The MVP smoke workflow verifies input, audit, and lifecycle denial, but it does
not explicitly prove that the viewer can end its own local control session
through the token-protected `/disconnect` surface path. Before MVP trials, the
ready gate should exercise that consent-preserving escape path end to end.

## What Changes

- Add a bounded `viewer-disconnect` smoke subcheck after audit and lifecycle
  readiness.
- Post a fixed empty JSON body to the loopback viewer surface `/disconnect`
  endpoint with the existing per-run mutation token, same-origin header, and
  JSON content type.
- Require a `202` response with `{ ok: true, action: "disconnect" }` and report
  only fixed smoke metadata and safe reason codes.
- Teach the ready helper to accept the new fixed smoke subcheck and reject
  missing, duplicate, malformed, or unexpected subcheck metadata.
- Keep existing `/disconnect` server-side guard behavior authoritative and
  unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: the MVP smoke and ready helpers shall verify the
  viewer local surface disconnect path as a fixed bounded subcheck.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-session-smoke.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, `README.md`, and OpenSpec artifacts.
- Affected systems: local development smoke/ready verification only.
- Safety impact: improves proof that a viewer-side disconnect action is
  available and token-protected. This touches local surface tokens and
  disconnect workflow verification, but does not add capture, OS input,
  installer behavior, services, startup persistence, privilege elevation,
  credential access, clipboard access, remote shell behavior, AV/EDR behavior,
  Windows prompt behavior, unattended access, or hidden sessions.
