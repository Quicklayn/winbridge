# Security Review: Default token-env role-filter validation

## Scope
Default aggregate `mvp:ready` validation for host and viewer token-env role-filtered command text.

## Review
- The change is non-executing and only spawns the existing command kit helper for bounded text validation.
- No runtime session, capture, input, relay listener, viewer surface, browser, service, startup entry, or privilege elevation is started.
- Raw token values remain prohibited. The parser accepts only the reviewed environment-variable reference shape and fails closed on raw token drift.
- Readiness output remains fixed metadata only and does not echo generated commands, token references, token values, relay URLs, pairing codes, paths, stdout, stderr, child output, credentials, screen contents, input contents, or full secrets.

## Decision
Approved for implementation as a default readiness hardening increment.
