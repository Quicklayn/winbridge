## Context

`apps/agent-shell` already supports `--host-consent-timeout-ms` for interactive
host consent prompts and defaults that prompt to 60000 ms. The MVP command kit
prints non-executing two-PC trial commands with `--host-consent-prompt 'true'`
but currently leaves the timeout implicit, so operators cannot see or tune the
wait window from the generated command plan.

## Goals / Non-Goals

**Goals:**
- Add a command-kit `--host-consent-timeout-ms` option with the same integer
  safety bounds used by the agent-shell runtime.
- Render the host timeout argument in every generated host command that uses
  interactive consent.
- Keep default output explicit by printing `60000` when no override is
  provided.
- Extend readiness command-plan validation so missing or changed timeout
  rendering fails closed with bounded metadata.

**Non-Goals:**
- No changes to host consent protocol messages or audit events.
- No changes to capture, OS input application, relay authorization, token
  handling, installer behavior, services, startup persistence, elevation,
  unattended access, or Windows prompt behavior.
- No production identity/authentication changes.

## Decisions

1. Reuse the existing agent-shell bounds: integer `1..2147483647`.
   Alternative: introduce a smaller command-kit-specific bound. Reusing the
   runtime contract avoids the command plan rejecting values the host runtime
   already accepts.

2. Print the default timeout explicitly. Alternative: print only custom
   values. Explicit default output makes the consent window visible in the MVP
   checklist and prevents drift from hiding behind runtime defaults.

3. Validate readiness by checking generated command text internally, while
   readiness output remains bounded to fixed check names and reasons.
   Alternative: expose command text on failure. That would make debugging
   easier but conflicts with the existing readiness redaction posture.

## Risks / Trade-offs

- Command-plan fixtures will change where host commands are asserted. Mitigate
  with focused command-kit and readiness tests.
- Operators may set an impractically long timeout. Mitigate by retaining the
  existing bounded integer maximum and documenting the default.
- This does not make consent production-grade authentication. Mitigate by
  keeping docs clear that the MVP command kit remains a development helper.
