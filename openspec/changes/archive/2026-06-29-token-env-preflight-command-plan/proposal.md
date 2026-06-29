# Change: Token-env preflight command plan

## Why

Token-protected MVP trials already have a secret-safe full command plan, including
an all-smoke preflight command that copies a named environment variable into
`WINBRIDGE_RELAY_SHARED_TOKEN`. The preflight-only outputs still reject
`--token-env`, so operators cannot generate the same machine-readable preflight
plan for token-protected dry runs without switching back to the full session
plan.

## What Changes

- Allow `--preflight-only --token-env <NAME>` and
  `--only preflight --json --token-env <NAME>`.
- Render `preflight.ready-all-smoke` with an environment-reference assignment
  when a token environment name is provided.
- Keep raw token values rejected and keep preflight plans non-executing.
- Extend the default `mvp:ready` drift checks to validate the token-env
  preflight JSON plan.

## Safety Impact

This change touches token handling in command generation and readiness
validation only. It does not start relay, host, viewer, capture, input, browser,
installer, startup, service, privilege, persistence, or remote-control actions.
It preserves the existing rule that raw token values are never accepted or
printed.

## Non-Goals

- No production authentication change.
- No relay protocol change.
- No capture or input behavior change.
- No hidden, unattended, or persistent execution path.
