## Context

`mvp:ready` already validates default localhost and representative LAN
non-executing command plans through `mvp:commands -- --json`. The command kit
also supports `--token-env`, but that path is only covered by direct command kit
tests and is not part of the aggregate readiness gate.

## Goals / Non-Goals

**Goals:**

- Add a read-only ready step that invokes the command kit with a fixed safe
  token environment variable name.
- Validate only bounded metadata and command-plan invariants needed for the
  shared-token workflow.
- Keep aggregate output secret-safe and command-string-free.

**Non-Goals:**

- No token value lookup, token generation, token printing, or environment
  mutation.
- No relay startup, agent startup, sockets, browser launch, capture, input,
  services, startup persistence, unattended access, privilege elevation, or
  Windows prompt bypass.
- No production authentication design changes.

## Decisions

- Use `WINBRIDGE_RELAY_SHARED_TOKEN` as the fixed ready validation env name
  because it is already the documented relay runtime variable. The ready helper
  validates command rendering only; it does not require the variable to be set.
- Reuse `parseCommandPlanReadiness()` with an optional expected token env
  parameter. This keeps command-plan validation centralized and strict.
- The ready output will add a bounded check name `token-command-plan` and will
  not surface generated command strings or child output.

## Risks / Trade-offs

- The parser inspects generated command strings internally. Mitigation: those
  strings remain bounded child output and are never emitted by ready result
  formatters.
- The fixed env name checks only the documented token path. Mitigation: this is
  intentional for stable readiness; arbitrary env-name validation remains
  covered by command kit tests.
