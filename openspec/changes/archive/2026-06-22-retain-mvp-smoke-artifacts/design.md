# Design

## Approach

Extend `scripts/mvp-session-smoke.mjs` argument parsing with a flag-only
`--keep-artifacts` option. The option sets `keepArtifacts: true` for
`runMvpSessionSmokeCheck()`.

On success, the CLI prints `artifacts=<workDir>` instead of
`artifacts=cleaned` when retention is enabled. On failure, the runner already
skips cleanup when `rawOptions.keepArtifacts` is true; the CLI will keep bounded
failure output, so failures still report only safe reason codes.

The smoke runner will continue to create its own temporary work directory. This
avoids introducing arbitrary user-controlled output paths in this change.

## Security Rationale

Keeping a smoke work directory is useful for local MVP troubleshooting, but it
must not become a general diagnostics collection feature. The retained files are
limited to the same local artifacts the smoke check already creates. The CLI
prints only the temporary directory path, not file contents, frame bytes, local
surface mutation tokens, child output, tokens, pairing codes, or private
reasons.

## Alternatives Considered

- `--artifact-dir <path>`: deferred because arbitrary paths need more validation
  and cleanup semantics.
- Keeping artifacts by default on failure: deferred to avoid changing routine
  cleanup behavior and to keep retention explicit.
