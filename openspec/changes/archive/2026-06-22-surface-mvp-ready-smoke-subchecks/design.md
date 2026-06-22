## Context

The ready helper runs doctor and native preflight by default. With
`--include-smoke`, it also runs the local smoke check. The smoke check already
has bounded JSON output that contains only check names and booleans plus safe
artifact state.

## Design

When the ready plan includes smoke, the smoke command will be invoked as
`npm run mvp:smoke -- --json`. `runReadyCommand` will capture bounded stdout and
stderr internally instead of inheriting or printing them. The ready helper will
parse smoke stdout only after an exit-zero result and accept only a fixed set of
subcheck names: `relay`, `frame`, `surface`, `signal`, `input`, and `audit`.
Each accepted subcheck must have `ok=true`.

Text output may include bounded `smoke.<name>=ok` lines. JSON output may include
a `checks` array nested under the smoke check. The ready helper must not echo
raw child output, local paths, frame bytes, mutation tokens, raw input commands,
relay tokens, pairing codes, credentials, private reasons, signal payloads,
audit contents, screen contents, clipboard contents, file-transfer contents, or
diagnostics dumps.

## Failure Handling

If the smoke process exits non-zero, the aggregate failure remains the existing
safe `exit-nonzero` or `spawn-failed` reason. If smoke exits zero but its JSON is
missing, malformed, or contains unexpected subcheck metadata, ready fails closed
with `exit-nonzero`.

## Non-Goals

- No change to smoke check semantics.
- No propagation of raw smoke stdout/stderr.
- No production UI or native Windows behavior changes.
