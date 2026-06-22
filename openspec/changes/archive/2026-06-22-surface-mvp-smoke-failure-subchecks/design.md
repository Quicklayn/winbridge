## Context

The MVP smoke check already runs a bounded local development workflow and emits
secret-safe JSON success metadata. On failure, JSON callers only receive
`ok=false` plus a safe reason code, which is enough for policy safety but too
coarse for CI diagnostics.

## Goals / Non-Goals

**Goals:**

- Surface fixed per-step failure status for known smoke failures.
- Keep the failure JSON schema bounded and compatible with existing safe reason
  output.
- Preserve cleanup behavior and fail-closed process shutdown.

**Non-Goals:**

- No new remote capability, capture path, input capability, auth path, relay
  protocol behavior, installer behavior, startup behavior, service behavior,
  token behavior, logging sink, or privilege behavior.
- No raw stdout/stderr, local paths, URLs, frame bytes, signal payloads, audit
  contents, input contents, tokens, pairing codes, credentials, private reasons,
  or full exceptions in JSON output.

## Decisions

- Failure JSON will use the same fixed subcheck names as success JSON:
  `relay`, `frame`, `surface`, `signal`, `input`, and `audit`.
  This keeps downstream parsing simple and avoids exposing process names,
  commands, ports, paths, or runtime internals.
- Known step reasons will map to prefix progress:
  completed earlier checks are `ok=true`, the failing check is `ok=false`, and
  later checks are marked `skipped=true`.
  This gives CI a stable failure location while avoiding raw child output.
- Startup failures before a precise smoke subcheck is reached will return the
  existing safe reason code without speculative subcheck metadata.
  This avoids implying a stage completed when host/viewer startup failed before
  the workflow reached frame, surface, signal, input, or audit verification.

## Risks / Trade-offs

- Safe reason to subcheck mapping could become stale if the smoke sequence
  changes. Mitigation: keep mapping centralized and cover representative failure
  reasons with focused unit tests.
- Failure metadata is less detailed than raw logs. Mitigation: this is
  intentional; `--keep-artifacts` remains the explicit local troubleshooting
  path without leaking runtime contents in JSON.
