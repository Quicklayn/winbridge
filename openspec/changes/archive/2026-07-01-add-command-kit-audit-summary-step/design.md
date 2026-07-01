## Context

`npm run mvp:commands` is the reviewed non-executing operator plan for a
two-PC development MVP trial. `npm run mvp:audit-summary` now exists as a
separate read-only post-run evidence helper, but it is not included in the
generated plan or in `mvp:ready` command-plan drift checks.

## Goals / Non-Goals

**Goals:**
- Add a fixed post-run audit summary command to command-kit text and JSON.
- Keep the command non-executing: generation must not read audit files or
  inspect runtime artifacts.
- Make `mvp:ready` fail closed if the generated preflight command-plan JSON no
  longer contains the fixed post-run audit summary command.
- Keep output bounded and avoid introducing raw audit records, tokens, pairing
  codes, command output, or secrets.

**Non-Goals:**
- No automatic audit summary execution from `mvp:commands` or `mvp:ready`.
- No log discovery, remote log retrieval, log upload, or raw audit viewer.
- No relay, host, viewer, browser, capture, input, service, startup,
  privilege, unattended, or Windows prompt behavior changes.

## Decisions

1. Add `preflight.audit-summary` to the same fixed command-plan list used for
   preflight JSON and full session JSON. This keeps readiness parsing simple:
   `mvp:ready` can validate one bounded command name and exact command string.

2. Keep the generated command fixed to the command-kit host/viewer audit path
   options:
   `npm run mvp:audit-summary -- --host <host-audit-log> --viewer <viewer-audit-log>`.
   This mirrors the printed host/viewer commands and remains non-executing.

3. Render the command under a separate post-run section in text output rather
   than as a preflight action to avoid implying that audit files must exist
   before the trial. JSON keeps the `preflight.` namespace for compatibility
   with existing readiness command-plan parsing, but the command text itself is
   documented as post-run only.

## Risks / Trade-offs

- Operators could run the audit summary before logs exist. Mitigation: text
  output labels it as post-run and the helper already fails closed with bounded
  reason metadata.
- Paths in generated text are local development paths. Mitigation: command-kit
  path validation already bounds these values and rejects unsafe path metadata.
- `mvp:ready` only validates command presence; it does not execute the post-run
  helper. Mitigation: readiness remains non-executing by design and avoids
  reading logs before a trial.
