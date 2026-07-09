## Why

The MVP role runner accepts relay shared tokens only through `--token-env`, but
the existing `dev:agent` runtime still accepts relay tokens only as raw
`--token` argv values. That leaves the live host/viewer child process with the
resolved token in argv even though the operator-facing MVP workflow is already
env-name based.

This change hardens the development MVP path by adding an env-only token input
for the agent shell and making the runner/command surfaces prefer it.

## What Changes

- Add `--token-env <ENV_NAME>` support to `npm run dev:agent -- <host|viewer>`.
- Resolve and validate the named environment variable inside the agent shell
  with the same token constraints as existing `--token`.
- Reject ambiguous use of both `--token` and `--token-env`.
- Update `mvp:run` live host/viewer argv to pass `--token-env <NAME>` instead
  of resolved token values.
- Update command-kit host/viewer token references, readiness checks, docs, and
  tests so the reviewed MVP path no longer requires raw agent token argv.

## Safety Impact

This touches token handling and command/runtime launch surfaces. It does not
change host consent, visible session indicators, authorization grants, capture,
input application, audit semantics, relay authentication, networking, services,
startup behavior, privilege elevation, or Windows security prompts.

The change reduces secret exposure risk by keeping relay shared token values in
environment variables instead of agent argv in the reviewed MVP flow.

## Non-Goals

- No production identity, MFA, RBAC, account auth, token generation, rotation,
  or storage.
- No hidden sessions, unattended access, stealth persistence, service install,
  credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or
  hidden capture/input.
- No change to relay shared-token validation or wire protocol behavior.
- No removal of the legacy `--token` runtime option in this increment; it
  remains for compatibility but is rejected when combined with `--token-env`.
