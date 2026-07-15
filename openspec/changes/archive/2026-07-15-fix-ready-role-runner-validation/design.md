## Context

`mvp:ready` invokes child npm scripts through the npm CLI so it validates the
same package-script entrypoints developers use. For role-runner dry runs, npm
prints a lifecycle banner containing the fixed readiness session, pairing, and
relay arguments before the bounded JSON line. The existing parser intentionally
rejects those values anywhere in child output, so aggregate readiness fails
even though the dry-run JSON itself is reviewed and safe.

## Goals / Non-Goals

**Goals:**

- Preserve validation through the root `mvp:run` package script.
- Suppress npm lifecycle banners only for readiness role-runner dry runs.
- Strengthen dry-run JSON validation to exact ordered `args` and `env` arrays.
- Make default aggregate `mvp:ready` reach and pass all non-executing checks.

**Non-Goals:**

- No changes to live role execution, runner roles, dry-run JSON shape, tokens,
  capture, input, relay behavior, audit persistence, or Windows APIs.
- No relaxation of output bounds or secret-safe diagnostics.
- No child process, socket, browser, capture, or input execution beyond the
  existing non-executing readiness checks.

## Decisions

1. Add npm's global `--silent` option only to `role-runner-*-dry-run` plan
   steps.

   This preserves package-script alignment while removing the lifecycle banner
   that contaminates stdout. Applying silent mode globally would broaden the
   change and could hide useful diagnostics from unrelated readiness helpers.

2. Make `parseMvpRoleRunnerDryRunReadiness()` exact.

   The parser will continue rejecting session, pairing, relay, token, path,
   URL, and secret markers anywhere in captured output. It will additionally
   compare the complete ordered `args` and `env` arrays against the reviewed
   relay, host, or viewer shape. Marker-presence checks were rejected because
   they accept appended unreviewed values. Stripping or ignoring banner text
   inside the parser was also rejected because it would weaken the
   whole-output leak boundary.

3. Verify both plan construction and real aggregate execution.

   Focused tests will assert the silent npm invocation and fail closed on a
   synthetic lifecycle banner, appended argument values, and extra environment
   markers. The implementation gate will also run the real default
   `npm run mvp:ready -- --json` command.

## Risks / Trade-offs

- npm option placement can differ across wrappers -> Keep `--silent` before
  `run`, which is supported as a global npm option, and verify through the real
  repository command on Windows.
- Silent mode can hide npm wrapper errors -> The child exit status remains
  authoritative, and readiness emits only fixed bounded failure metadata.
- A future package manager could change banner behavior -> Focused plan tests
  and the real aggregate readiness gate fail closed on drift.
