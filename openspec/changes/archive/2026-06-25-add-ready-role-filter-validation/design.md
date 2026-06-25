## Context

The MVP command kit can now print target-specific text blocks with
`--only relay|host|viewer|browser|preflight`. `mvp:ready` still validates only
the full JSON command plan variants, so a broken filtered operator workflow
could pass readiness until a two-PC trial.

## Goals / Non-Goals

**Goals:**

- Validate each fixed filtered command-kit target during the default
  `mvp:ready` gate.
- Fail closed on malformed, cross-target, oversized, or unsafe filtered text.
- Keep ready output metadata-only and avoid echoing child command output.
- Preserve the existing non-executing readiness model.

**Non-Goals:**

- No automatic process launch beyond existing local readiness child commands.
- No relay runtime, capture, input, browser automation, audit writes, remote
  discovery, network probing, firewall changes, installer, startup, service,
  token, privilege, or authorization behavior changes.
- No JSON shape change for `mvp:commands -- --json`.
- No production deployment workflow.

## Decisions

- Add five fixed default readiness steps, one for each `--only` target.
  - Rationale: individual step names make failures actionable without exposing
    command text.
  - Alternative considered: one aggregate step that shells out internally. That
    would hide which operator block failed and bypass the existing runner
    structure.
- Parse the filtered text with target-aware allow/deny markers.
  - Rationale: the filtered output is intentionally human-readable, so the
    readiness gate only needs stable structural markers and cross-target
    rejection rather than a full command parser.
- Keep all formatter output bounded to check names, booleans, skipped state,
  and safe reason codes.
  - Rationale: filtered text contains paths, URLs, pairing codes, and
    environment variable references that should not be replayed by `mvp:ready`.

## Risks / Trade-offs

- The default readiness gate will run more child commands.
  - Mitigation: each command remains non-executing command generation and the
    steps are fixed and sequential.
- Text marker validation can drift when command-kit wording changes.
  - Mitigation: keep parser markers tied to stable headings and command
    prefixes, and cover every fixed target with tests.
