## Security Review

Change: `add-ready-evidence-fixture-gate`

Reviewed paths:

- `scripts/mvp-ready.mjs`
- `scripts/mvp-ready.test.ts`
- `README.md`
- `openspec/specs/mvp-session-command-kit/spec.md`
- `openspec/changes/add-ready-evidence-fixture-gate/specs/mvp-session-command-kit/spec.md`

## Findings

No policy-blocking issues found.

## Safety Assessment

- The new readiness gate is explicit opt-in through
  `--include-evidence-fixture`; default `mvp:ready` does not run the fixture
  helper and does not add fixture writes.
- The gate runs the existing local fixture helper in strict JSON verification
  mode and accepts only bounded metadata: `ok=true`, reviewed host/viewer
  record counts, and `verified=true`.
- Readiness output is limited to fixed check status metadata. Raw fixture
  JSONL, generated paths, stdout/stderr, identifiers, tokens, pairing codes,
  frame bytes, input contents, and secrets are not echoed.
- Role-scoped readiness rejects the flag before running checks so relay, host,
  and viewer per-machine readiness remains focused on local prerequisites.
- The change does not alter relay runtime behavior, authorization semantics,
  host consent, visible session state, capture, input application, sockets,
  HTTP listeners, installer/startup/service behavior, privilege elevation,
  unattended access, credential handling, AV/EDR behavior, or Windows prompt
  behavior.

## Residual Risk

Generated fixture evidence could be confused with live two-PC evidence by an
operator. README and specs label the gate as a local dry run and keep
`mvp:trial -- --evidence` / `mvp:audit-summary -- --require-mvp-evidence` as
the post-run evidence path for live trials.
