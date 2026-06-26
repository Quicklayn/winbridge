# Guard generated pairing role filters

## Why

`mvp:commands -- --generate-pairing` generates one pairing code and renders both
host and viewer commands in the same process, so the code stays consistent.
When combined with `--only host` and `--only viewer`, separate invocations can
generate different pairing codes and produce a two-PC trial that cannot pair.

## What Changes

- Reject `--generate-pairing` whenever `--only` selects a role-specific command
  target.
- Keep full text and JSON session plans with `--generate-pairing` supported.
- Keep `--only` supported with the default pairing or an explicit `--pairing`
  value supplied by the operator.

## Safety Impact

This is a CLI validation hardening change. It does not start processes, grant
permissions, capture screens, apply input, persist credentials, change relay
auth, alter audit contents, install services, add startup persistence, elevate
privileges, or bypass Windows prompts. It reduces operator error during visible
consent-first MVP trials.

## Non-Goals

- Do not change pairing code format or entropy.
- Do not add live pairing exchange or remote discovery.
- Do not change runtime host/viewer authorization behavior.
