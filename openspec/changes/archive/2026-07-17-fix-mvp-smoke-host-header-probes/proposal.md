## Why

The MVP smoke helper asks Fetch API to send a mismatched `Host` header, but the
current Node runtime can replace that forbidden header with the URL host. The
live host surface then accepts the supposedly negative probe, mutates the
session, and makes `npm run mvp:smoke -- --json` fail at
`host-surface-not-ready` without having tested the required guard.

## What Changes

- Send the host and viewer mismatched-`Host` smoke probes through a bounded
  direct HTTP transport that preserves the exact fixed header on the wire.
- Restrict that transport to already validated uncredentialed
  `http://127.0.0.1:<non-privileged-port>/` surface URLs, fixed paths, fixed
  methods and bodies, no redirects, absolute bounded response bytes and time,
  and cancellation through smoke cleanup.
- Run each mismatched-Host negative probe once after surface readiness and fail
  immediately instead of retrying an accepted or unsafe mutation request.
- Keep all ordinary readiness, token, origin, content-type, input, lifecycle,
  and disconnect requests on the existing fetch path.
- Fail closed on invalid URLs, transport errors, timeout, oversized or
  malformed responses, server errors, accepted probes, or unexpected JSON
  without exposing local endpoints, headers, tokens, bodies, or diagnostics.
- Add focused raw-server tests proving the live request carries the fixed
  mismatched `Host` value and cannot be counted as guarded when it is accepted.
- Update smoke documentation for the direct loopback guard-probe boundary.

Safety impact: this changes only the local development smoke verifier for host
and viewer surface guards. It touches local mutation-token handling inside
negative probes but does not change the product control surfaces, relay, auth,
capture, input application, installer, startup, services, logs, or privilege
behavior. It does not add remote endpoints, LAN/public HTTP access, hidden or
unattended sessions, persistence, credential access, keylogging, AV/EDR
evasion, Windows prompt bypass, hidden capture, or hidden input.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: Require mismatched-`Host` smoke probes to preserve
  the fixed header on the wire through a bounded direct loopback HTTP boundary.

## Impact

- `scripts/mvp-session-smoke.mjs`: direct loopback probe transport and guard
  call-site wiring.
- `scripts/mvp-session-smoke.test.ts`: wire-level Host, bounds, failure, and
  redaction tests.
- `README.md`, `docs/security-model.md`, and the existing
  `mvp-session-command-kit` requirements.
- No protocol schema, relay route, local control-surface behavior, dependency,
  installer, service, native capture, or native input change.
