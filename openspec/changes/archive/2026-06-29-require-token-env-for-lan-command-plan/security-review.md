# Security Review

## Decision

Approved for implementation as a fail-closed MVP command-generation hardening
change.

## Review Notes

- The change must only reject unsafe command plan generation; it must not start
  relay, host, viewer, browser, smoke, capture, or input processes.
- Localhost/loopback development command plans may remain tokenless because they
  are same-machine only and do not bind the relay to LAN interfaces.
- LAN/non-loopback command plans must require bounded token environment
  references and must not print raw token values.
- Diagnostics must remain static and must not echo relay hosts, relay URLs,
  token environment values, command text, credentials, pairing codes, local
  paths, stdout, stderr, child output, or raw input.
- The change must not affect host consent, visible session state, revocation,
  disconnect, audit gates, installer behavior, services, startup persistence,
  privilege elevation, stealth, unattended access, or Windows prompt behavior.
