## Context

The smoke helper currently passes `host: "example.invalid:80"` to Fetch API
for the viewer `/status` guard and host `/control` guard. `Host` is a forbidden
Fetch request header, and the current Node implementation sends the URL host
instead. The host control request therefore reaches the valid mutation path
with a valid origin and mutation token, accepts `pause`, and causes the smoke
workflow to fail only after mutating the session.

The product surfaces already compare the received HTTP `Host` header against
their loopback listener. Raw HTTP tests cover those guards, but the executable
smoke workflow must also prove the live guard using the exact wire request. The
smoke process already extracts and strictly validates an uncredentialed
`http://127.0.0.1:<port>/` URL for each surface.

## Goals / Non-Goals

**Goals:**

- Send the exact fixed mismatched `Host` value to the live host and viewer
  surfaces during smoke.
- Keep the probe loopback-only, non-redirecting, time-bounded, byte-bounded,
  closeable, deterministic, and secret-safe.
- Preserve the existing fixed negative probes and fail-closed smoke reasons.
- Prove at wire level that the server observed the mismatched header and that
  accepted, malformed, oversized, timed-out, or failed responses do not count
  as guarded.

**Non-Goals:**

- Changing host or viewer local control-surface guards or mutation behavior.
- Adding an arbitrary HTTP client, LAN/public probe support, redirects, proxy
  support, TLS, credentials, cookies, reusable connections, or remote URLs.
- Changing relay, auth, capture, input application, lifecycle, audit, browser,
  installer, startup, service, persistence, or privilege behavior.
- Printing URLs, ports, origins, Host values, tokens, bodies, response data, or
  raw transport diagnostics.

## Decisions

### Use Node direct HTTP only for the two mismatched-Host probes

Import `request` from `node:http` and use it only behind two fixed helpers: a
viewer `GET /status` probe and a host `POST /control` probe with the existing
fixed pause body, local origin, and mutation token. Both helpers re-run the
existing safe surface URL parser, connect to literal `127.0.0.1` and the
validated non-privileged port, set the fixed mismatched `Host` header, disable
connection reuse, and never follow redirects.

The remaining readiness and token/origin/content-type probes keep using the
existing injected Fetch implementation. This limits the native HTTP boundary
to the one header Fetch cannot faithfully transmit.

Alternative considered: use Fetch `headers.host` or a custom `Headers`
instance. The runtime is allowed to normalize or replace forbidden headers, so
that cannot prove the wire value.

Alternative considered: use a raw TCP socket. `node:http.request` already
provides correct HTTP framing and response parsing while still allowing an
explicit `Host`; raw TCP would add avoidable parser and smuggling risk.

### Keep request construction closed and response handling bounded

Callers provide only the validated surface URL and, for the host probe, the
already extracted bounded mutation token. They cannot choose arbitrary hosts,
paths, methods, headers, or bodies. The transport accepts only a 4xx response
whose complete JSON body is at most 1 KiB and exactly
`{ "ok": false, "error": "rejected" }`.

Each request uses an independent wall-clock timer that cannot be extended by
slow-drip socket activity, resolves only once, destroys the request and active
response on timeout or overflow, and treats request/response errors, abort,
premature close, redirect, 2xx/3xx/5xx, malformed JSON, extra keys, and excess
bytes as failure. No raw error or response is forwarded into smoke output.

The smoke runner owns an `AbortController` for direct guard probes. Its
existing one-shot process cleanup aborts that controller before stopping child
processes, so `SIGINT`, `SIGTERM`, normal failure, and final cleanup cannot
leave a probe socket alive. The transport removes its abort listener and
clears its wall-clock timer in the same one-shot settlement path.

Alternative considered: reuse the overall 45-second smoke deadline as the
only bound. One hung request would consume the entire workflow and make retry
behavior unpredictable; an independent per-probe bound gives deterministic
cleanup.

### Inject only the fixed high-level probe in orchestration tests

The guard aggregation helpers accept an optional fixed probe function for unit
tests. Production smoke defaults to the direct HTTP implementation. Once a
surface has passed readiness, each negative guard set runs exactly once. The
mismatched-Host probe runs first; if it is accepted or otherwise unsafe, the
subcheck fails immediately and does not retry the mutation request.

Focused wire tests start a temporary loopback server, assert the received
`Host`, path, method, origin, token and bounded body, and return fixed
responses. Tests also cover invalid URLs without opening a socket,
accepted/oversized/slow-drip failure behavior, abort cleanup, and one-shot
handling after an accepted host mutation.

This keeps ordinary Fetch-call assertions useful without mocking the
`ClientRequest` event state machine, while the raw-server tests prove actual
network behavior.

## Risks / Trade-offs

- **The host probe carries a valid mutation token and pause body.** -> Send it
  only with the mismatched `Host`, require the live guard to reject, and fail
  immediately if accepted; never retry a successful mutation as guarded.
- **A direct client could accidentally reach a non-loopback endpoint.** ->
  Re-parse the canonical URL inside the transport and construct connection
  options from literal `127.0.0.1` plus the validated port only.
- **A server can stream an unbounded body or hold the connection open.** ->
  Enforce the 1 KiB byte limit, absolute wall-clock timer, cleanup abort,
  one-shot settlement, and request/response destruction.
- **An accepted host mismatch probe can invoke pause.** -> Run the probe first
  and exactly once after readiness, fail immediately on any non-rejection, and
  never poll or repeat that mutation request.
- **Adding a second HTTP mechanism increases test-helper complexity.** -> Keep
  it private to two fixed probes and leave every other smoke request on Fetch.

## Migration Plan

1. Add direct fixed probe helpers and wire them into host/viewer guard checks.
2. Add focused unit and raw-loopback tests, then run the previously failing
   default smoke workflow.
3. Update bounded documentation and run repository verification plus security
   review.
4. Roll back by restoring the Fetch probes if the direct client is unstable;
   no stored data, protocol, product surface, or deployment migration exists.

## Open Questions

None.
