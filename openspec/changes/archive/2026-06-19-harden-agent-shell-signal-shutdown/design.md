# Design: Harden agent-shell signal shutdown

## Context

The CLI currently registers SIGINT and SIGTERM handlers inline in `index.ts`.
Both handlers call the same async cleanup, but repeated signals can start
overlapping cleanup attempts and can request process exit more than once. The
MVP smoke check depends on predictable CLI termination, and local viewer
surface shutdown is already specified to stop with the viewer CLI.

## Approach

Add a small testable signal shutdown helper that:

- registers SIGINT and SIGTERM on a provided signal target,
- starts cleanup at most once,
- ignores later signal events while cleanup is in progress or complete,
- exits `0` after successful cleanup,
- reports the sanitized CLI diagnostic path and exits `1` after cleanup failure,
- returns an unregister handle for tests and future embedding.

`index.ts` keeps ownership of the concrete handles and runtime cleanup order.
The helper receives only the existing `shutdown` function and existing
`reportAgentShellCliError` reporter.

## Security Rationale

This is a local process lifecycle hardening change. It does not alter
authorization, permissions, frame contents, input contents, relay credentials,
or host visibility. On failure, diagnostics continue through the existing
bounded CLI reporter instead of printing raw exception text directly.

## Alternatives

- Keep inline signal handlers: less code, but leaves duplicate cleanup
  behavior untested.
- Use `process.once`: prevents duplicate callbacks for the same signal but not
  overlap across SIGINT and SIGTERM, and is harder to unit test without loading
  the CLI entrypoint.
