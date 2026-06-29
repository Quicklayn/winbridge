## Context

The development viewer local control surface binds to `127.0.0.1`, renders a
nonce-protected HTML page, serves sanitized `/status`, serves the configured
latest frame through `/frame`, and requires same-origin plus a per-run token for
`/input` and `/disconnect`. Mutation routes are already guarded, but read-only
routes still rely primarily on loopback binding and browser same-origin policy.

DNS rebinding or misdirected local origins can turn a loopback listener into a
same-origin target for an attacker-controlled host name. The surface should
therefore reject requests whose `Host` header does not match the exact resolved
loopback URL that WinBridge prints for the operator.

## Goals / Non-Goals

**Goals:**

- Require the exact expected `Host` value for all viewer local control surface
  routes.
- Reject missing or mismatched Host headers before serving HTML, status, frame
  bytes, input, or disconnect behavior.
- Preserve existing loopback-only binding, Origin and token mutation checks,
  CSP, no-store responses, and redacted diagnostics.

**Non-Goals:**

- No CORS support.
- No LAN/public access to the local surface.
- No change to capture, input-event schema, relay routing, production auth, or
  Windows native execution.

## Decisions

1. Validate Host for every route.

   Rationale: `/status` and `/frame` are read-only but still expose sensitive
   session state and current screen pixels. Applying the same request-boundary
   rule to all routes avoids a split security model.

   Alternative considered: validate Host only for mutation routes. Rejected
   because mutation routes already require Origin plus token while the read
   routes are the larger DNS-rebinding exposure.

2. Match the resolved loopback URL host exactly.

   Rationale: the server logs and command kit direct the operator to
   `http://127.0.0.1:<port>/`. Matching the resolved `URL.host` keeps ephemeral
   ports supported while rejecting alternate host names that resolve to loopback.

   Alternative considered: allow `localhost:<port>` as an alias. Rejected for
   this increment because the generated URL is always `127.0.0.1`, and stricter
   matching reduces ambiguity.

3. Return a bounded rejected JSON response.

   Rationale: host-header failures should not leak requested paths, host names,
   local ports beyond the TCP connection, frame paths, tokens, authorization IDs,
   or command contents.

## Risks / Trade-offs

- Strict Host validation can reject manually edited local URLs such as
  `localhost:<port>` even when they resolve to the same listener. Mitigation:
  documentation and command output already use the canonical `127.0.0.1` URL.
- Some low-level clients can omit Host headers. Mitigation: browsers and normal
  HTTP/1.1 clients send Host; rejecting missing Host is the safer local-surface
  default.

## Migration Plan

No migration is required. Existing command-kit and viewer logs already print the
canonical URL. Operators should continue opening the printed URL exactly.

## Open Questions

None.
