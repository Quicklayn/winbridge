# Design

## Approach

Add the root helper files to `REQUIRED_MVP_ENTRYPOINT_FILES` in
`scripts/mvp-doctor.mjs`. The existing `checkEntrypointFiles()` function already
uses injected `exists()` and reports only the bounded `missing-entrypoint`
reason, so the implementation stays small and preserves current diagnostics.

## Security Rationale

The doctor remains a static filesystem existence check. It does not import or
execute helper scripts, spawn child processes, open sockets, invoke native
adapters, read screen/input contents, write files, or expose raw missing paths.
