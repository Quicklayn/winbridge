## Context

The ready helper already runs `mvp:smoke -- --json` only when explicitly
requested with `--include-smoke`. Success subchecks are parsed and surfaced in
aggregate output. Failure subchecks are currently treated as malformed because
the parser accepts only `ok=true` smoke results.

## Goals / Non-Goals

**Goals:**

- Preserve fixed, secret-safe smoke failure subchecks in `mvp:ready` aggregate
  output.
- Keep aggregate ready reasons limited to existing ready reason codes.
- Reject malformed, duplicated, unknown, or unsafe smoke failure metadata.

**Non-Goals:**

- No new remote assistance capability, capture path, input path, auth path,
  relay behavior, installer behavior, startup behavior, service behavior, token
  handling, log sink behavior, or privilege behavior.
- No raw smoke child output, paths, URLs, ports, commands, frame bytes, audit
  contents, signal payloads, input contents, pairing codes, tokens,
  credentials, private reasons, or raw exceptions in ready output.

## Decisions

- Add a single bounded smoke result parser for ready aggregation. It will accept
  exactly the fixed smoke subcheck names and require the complete six-item set.
- For smoke success, subchecks must all be `ok=true`.
- For smoke failure, subchecks may contain fixed `ok` booleans and optional
  `skipped=true` markers. The ready helper will still report the aggregate
  ready reason as `exit-nonzero`.
- Formatters will serialize subchecks for both successful and failed smoke
  checks, but only as fixed names, `ok` booleans, and optional `skipped`.

## Risks / Trade-offs

- The ready helper remains intentionally less detailed than raw smoke logs.
  Mitigation: keep JSON bounded and rely on explicit local `mvp:smoke
  -- --keep-artifacts` for manual troubleshooting.
- Parser strictness can reject future smoke metadata until ready is updated.
  Mitigation: keep this fail-closed behavior because ready output is designed
  for stable automation and secret-safe diagnostics.
