# Change: Verify viewer Host guard in MVP smoke

## Why

The viewer local control surface now rejects requests whose `Host` header does
not exactly match the resolved `127.0.0.1:<port>` URL. Unit coverage protects
the route handler, but the executable MVP readiness path should also fail if
the live smoke workflow regresses and accepts a mismatched Host request before a
two-PC trial.

## What Changes

- Add a bounded live smoke probe for a mismatched Host header.
- Keep the check inside the existing `surface-guards` smoke subcheck.
- Add unit coverage for success and failure handling.
- Update security/readiness docs to mention Host-header guard coverage.

## Non-Goals

- No production browser automation.
- No LAN/public viewer surface exposure.
- No Windows capture or OS input changes.
- No auth, relay, installer, service, startup, privilege, or persistence
  behavior changes.

## Safety Impact

This change is verification-only for the local development smoke workflow. It
does not widen access. The new probe must use a fixed invalid Host value, expect
a bounded rejection body, and must not print local URLs, ports, origins,
mutation tokens, frame bytes, command bodies, child output, credentials, or raw
diagnostics in success or failure output.
