# Security Review

## Decision

Approved for implementation as a verification-only MVP smoke hardening change.

## Review Notes

- The change must not start new long-lived listeners or widen the viewer surface
  bind address.
- The Host probe must use a fixed invalid Host header and require the existing
  bounded rejection body.
- Failures must remain mapped to fixed smoke reason metadata and must not echo
  local URLs, ports, Host values, origins, mutation tokens, frame bytes, command
  bodies, child output, credentials, input contents, or raw diagnostics.
- The change must not affect consent, authorization, audit, capture, input,
  relay, installer, service, startup, privilege, persistence, stealth, or
  unattended-access behavior.
