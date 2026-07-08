## Context

`mvp:ready` already aggregates local pre-trial checks and can optionally run
smoke paths that start runtime processes. `mvp:evidence-fixture` now provides a
separate generated local fixture dry run for the strict post-run evidence gate.
The two helpers are adjacent in the operator workflow, but the fixture dry run
is not yet reachable through a reviewed readiness include flag.

## Goals / Non-Goals

**Goals:**

- Add `--include-evidence-fixture` to `mvp:ready`.
- Keep default readiness read-only and non-writing.
- Run the fixture helper only when explicitly requested, using `--verify
  --json`.
- Validate the fixture helper's bounded JSON result instead of surfacing its
  raw output.
- Reject role-scoped combinations so relay/host/viewer readiness remains
  focused on role prerequisites.

**Non-Goals:**

- No change to `mvp:evidence-fixture` generated record semantics.
- No change to strict audit-summary evidence requirements.
- No relay, host, viewer, browser, capture, input, network listener, remote log
  retrieval, log upload, production account, installer, startup, service,
  privilege elevation, unattended access, or Windows prompt behavior.

## Decisions

1. Make the gate opt-in rather than default.

   Rationale: the fixture helper writes local files, while default `mvp:ready`
   is currently mostly read-only except explicitly included smoke paths.
   Alternative considered: always run the fixture. Rejected because that would
   add filesystem writes to the default aggregate readiness command.

2. Validate JSON shape in `mvp:ready`.

   Rationale: readiness output must remain bounded and should not expose raw
   helper output. The ready helper can accept only `ok=true`, fixed record
   counts, and `verified=true`.

3. Disallow role mode combinations.

   Rationale: evidence fixture verifies a cross-role post-run gate. It is not a
   relay-only, host-only, or viewer-only prerequisite.

## Risks / Trade-offs

- Generated fixtures may be mistaken for live evidence -> README and CLI usage
  continue to label them as dry-run fixtures, and `mvp:ready` exposes the gate
  only as `evidence-fixture`, not as trial proof.
- The include flag writes local files -> It remains explicit and uses the
  existing fixture helper's bounded path/default behavior.
