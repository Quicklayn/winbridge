## Context

The audit summary helper already parses explicit host/viewer JSONL files and
prints bounded role counts plus fixed coverage flags. That is useful for
inspection, but a missing evidence flag can be overlooked because the command
still exits successfully. The MVP command kit also prints the summary command
as the post-run step, so that command should represent a real pass/fail gate
for the trial.

## Goals / Non-Goals

**Goals:**
- Add a strict post-run evidence gate without changing the raw log parser into
  a general audit explorer.
- Require the existing fixed MVP evidence flags when
  `--require-mvp-evidence` is supplied.
- Preserve default summary mode for partial-log troubleshooting.
- Update generated command plans so the recommended two-PC workflow uses the
  strict gate.
- Keep failure reasons bounded and avoid echoing missing raw audit data.

**Non-Goals:**
- No remote log retrieval, upload, or production audit backend.
- No new audit record schema.
- No live runtime, network, capture, input, browser, service, startup,
  privilege, unattended, or Windows prompt behavior.
- No raw event timeline or diagnostic dump output.

## Decisions

1. The strict gate uses the existing fixed evidence vocabulary instead of new
   record requirements. This keeps the gate aligned with current smoke and
   summary semantics.

2. The missing-evidence failure reason is a single fixed
   `missing-required-evidence` value. The text summary may list only fixed flag
   names, never record contents or paths.

3. The command kit's `preflight.audit-summary` command includes the strict
   flag by default because it is meant to be run after the visible trial. The
   audit-summary CLI itself keeps non-strict mode for debugging partial logs.

## Risks / Trade-offs

- Strict evidence can fail legitimate partial troubleshooting runs. Mitigate by
  making it explicit and leaving default summary mode unchanged.
- Some evidence could be present in a future action name that is not mapped
  today. Mitigate by updating the fixed mapping through future OpenSpec changes
  rather than accepting arbitrary audit actions.
