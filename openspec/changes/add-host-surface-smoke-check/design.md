## Context

The root MVP smoke workflow launches a bounded same-machine relay, host, and
viewer. It verifies visible host activation, frame output, viewer local surface
readiness, viewer mutation guards, input acceptance, audit evidence, lifecycle
denial, and viewer disconnect. The host local control surface is already an
opt-in host-only loopback runtime, and the MVP command kit now includes it, but
the smoke workflow does not yet start or verify it.

## Goals / Non-Goals

**Goals:**

- Start the smoke host with `--host-control-surface-port 0`.
- Extract exactly one bounded host loopback URL from host output.
- Verify host surface HTML/status availability and sanitized active visible
  host status.
- Verify fixed local mutation guard denials for mismatched `Host`, missing
  token, foreign `Origin`, and unsafe content type.
- Surface the result as a fixed `host-surface` smoke subcheck in text and JSON
  output, and teach `mvp:ready` to accept that subcheck.

**Non-Goals:**

- Do not drive host pause, resume, revoke, terminate, or disconnect through the
  host surface in this increment.
- Do not add browser automation or launch a browser.
- Do not expose mutation tokens, generated URLs, child output, command text,
  authorization ids, permission arrays, screen contents, input contents, audit
  records, or secrets in diagnostics.
- Do not bind the host surface to LAN interfaces or change production UX.

## Decisions

- Reuse the existing smoke polling pattern. Host surface readiness is checked
  after the host visible indicator is active and before frame/viewer checks, so
  the host local control path is proven while the session is visibly active.
- Add a host-specific safe URL extractor that mirrors the viewer extractor but
  matches the host log marker. It accepts only one `http://127.0.0.1:<port>/`
  URL with port `1024..65535` and no credentials, path, query, or fragment.
- Verify guards with fixed negative POSTs and status requests only. Accepted
  lifecycle mutations are already covered by host surface unit tests; the root
  smoke path should avoid changing the existing lifecycle sequence until a
  separate spec covers that behavior.
- Use a new bounded failure reason `host-surface-not-ready` mapped to the fixed
  `host-surface` subcheck. Existing output redaction behavior remains intact.

## Risks / Trade-offs

- [Risk] Smoke runtime becomes slightly longer and depends on another local
  listener. -> Mitigation: use ephemeral loopback port `0` and the existing
  smoke deadline/polling cleanup path.
- [Risk] Guard probes could accidentally invoke host controls. -> Mitigation:
  send only malformed or rejected requests and assert rejection before runtime
  mutation.
- [Risk] Adding a new smoke subcheck can break readiness parsing until synced.
  -> Mitigation: update `mvp:ready` parser and tests in the same change.
