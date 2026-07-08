## Context

`mvp:audit-summary` can already enforce strict role-bound evidence after a
two-PC MVP trial. The missing piece is a deterministic local dry run that proves
the evidence gate, output bounds, path validation, and operator documentation
without requiring a live relay, host, viewer, browser, screen capture, or OS
input.

## Goals / Non-Goals

**Goals:**

- Provide a root `mvp:evidence-fixture` helper for generating minimal safe host
  and viewer audit JSONL files that satisfy the existing strict MVP evidence
  gate.
- Support explicit output paths and a `--verify` mode that invokes the existing
  in-process audit-summary check on the generated files.
- Keep text and JSON output bounded to fixture status metadata and fixed path
  labels, never raw audit record contents or identifiers.
- Add doctor alignment and focused tests so the helper remains part of the
  reviewed MVP command surface.

**Non-Goals:**

- No changes to strict evidence semantics in `mvp:audit-summary`.
- No real relay, host, viewer, browser, capture, input, network listener, remote
  log retrieval, or log upload behavior.
- No production audit storage, telemetry, account identity, installer, startup,
  service, privilege elevation, unattended access, or Windows prompt handling.

## Decisions

1. Generate deterministic safe records instead of copying sample files.

   Rationale: code-generated records reuse the same bounded action names and
   can be tested without maintaining fragile fixture blobs. Alternative
   considered: committed JSONL fixture files. That would be simpler but easier
   to drift from helper/path/output validation.

2. Reuse `runMvpAuditSummaryCheck` for `--verify`.

   Rationale: the fixture helper should prove the real strict evidence gate
   rather than duplicating coverage logic. Alternative considered: shelling out
   to `npm run mvp:audit-summary`; rejected because it would add child output
   handling and make bounded diagnostics harder to guarantee.

3. Keep paths explicit but provide development defaults.

   Rationale: defaults make the dry run easy, while explicit `--host` and
   `--viewer` let operators place artifacts in their own working directory.
   All paths go through the same style of safe local path validation used by
   audit-summary.

## Risks / Trade-offs

- Fixture logs may be mistaken for real two-PC evidence -> Output and README
  label them as generated local fixtures and keep `mvp:trial -- --evidence` as
  the real post-run gate.
- Writing local files adds filesystem side effects -> The helper writes only to
  bounded explicit/default local paths, creates parent directories as needed,
  and never reads arbitrary logs except the files it just wrote for `--verify`.
- Strict evidence drift could make fixtures stale -> Focused tests assert
  `--verify` passes through the real audit-summary checker.
