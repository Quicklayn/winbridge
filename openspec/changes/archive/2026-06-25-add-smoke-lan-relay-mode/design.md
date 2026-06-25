## Context

`npm run mvp:smoke` currently starts a local relay on an ephemeral loopback
port and connects host/viewer through the local static development path. This
is useful for preflight, but it does not explicitly exercise the non-localhost
relay URL shape that the two-PC command plan uses.

The smoke check must remain safe: static frames only, no native capture, no OS
input application, no browser automation, no token handling changes, no service
or startup behavior, and no hidden or unattended operation.

## Goals / Non-Goals

**Goals:**

- Add an explicit CLI flag for a LAN-style local smoke mode.
- In that mode, bind the development relay on a local test port while host and
  viewer connect to `ws://127.0.0.1:<port>/`.
- Keep output and JSON bounded to existing safe result shapes.
- Include the mode in ready aggregation only when smoke is explicitly included.

**Non-Goals:**

- No real two-PC network probing or IP discovery.
- No firewall configuration.
- No Windows capture or OS input application in smoke.
- No production viewer UI or installer changes.
- No authentication, authorization, relay token, audit schema, service,
  startup, privilege, or Windows prompt behavior changes.

## Decisions

- Use an explicit `--lan-relay` flag instead of changing default smoke
  behavior. This preserves the fast existing local preflight and lets
  developers opt in to the extra relay URL coverage.
- Keep the relay bind host internal to the smoke process env rather than adding
  user-configurable bind options. This avoids exposing a broad networking
  surface through the smoke helper.
- Do not print the selected relay URL or port. Existing success/failure shapes
  are enough for readiness and avoid leaking runtime details into aggregate
  output.
- Keep static frames and local viewer-surface input checks. The goal is relay
  URL coverage, not native capture or OS input verification.

## Risks / Trade-offs

- LAN-style mode is still same-machine loopback, not a full two-PC proof. The
  mitigation is explicit naming and documentation that it is preflight coverage
  before the real two-PC trial.
- Binding the relay to `0.0.0.0` in smoke would be closer to a LAN trial but
  unnecessarily exposes a local development listener. The mitigation is to
  connect through `127.0.0.1` while keeping the relay itself local to the test.
- More smoke modes increase readiness runtime. The mitigation is to run the
  extra mode only behind explicit `--lan-relay` or `mvp:ready --include-smoke`.
