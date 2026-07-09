## Security Review

Change: `add-missing-evidence-diagnostics`

Reviewed paths:

- `scripts/mvp-audit-summary.mjs`
- `scripts/mvp-audit-summary.test.ts`
- `scripts/mvp-trial.mjs`
- `scripts/mvp-trial.test.ts`
- `README.md`
- `openspec/specs/mvp-audit-summary/spec.md`
- `openspec/changes/add-missing-evidence-diagnostics/specs/mvp-audit-summary/spec.md`

## Findings

No policy-blocking issues found.

## Safety Assessment

- Missing-evidence diagnostics are generated from fixed reviewed role/flag
  identifiers, not from raw audit records or file paths.
- The diagnostics are emitted only for strict `missing-required-evidence`
  failures; malformed path, file, JSONL, record, and unsafe metadata failures
  keep fixed reason-only output.
- Text and JSON output remain bounded and do not include raw audit records,
  local paths, event ids, actor ids, target ids, session ids, authorization
  ids, display names, private reasons, pointer coordinates, key values, frame
  bytes, screen contents, input contents, clipboard contents, file-transfer
  contents, diagnostics, tokens, token environment values, pairing codes,
  credentials, generated commands, stdout, stderr, child output, or secrets.
- The change does not start relay, host, viewer, browser, capture, input,
  sockets, HTTP listeners, services, startup persistence, unattended access,
  privilege elevation, remote log retrieval, log upload, credential access,
  keylogging, AV/EDR evasion, Windows prompt bypass, or hidden sessions.

## Residual Risk

Operators could treat missing role/flag metadata as a full audit report. README
and OpenSpec wording describe it as bounded missing evidence hints only; the
raw audit logs remain local and explicit.
