## Context

`mvp:ready` already has:

- a full LAN command-plan check using
  `mvp:commands -- --json --relay-host 192.168.1.10 --token-env WINBRIDGE_RELAY_SHARED_TOKEN`;
- default role-filter checks for localhost relay, host, viewer, browser, and
  preflight outputs;
- default token-env role-filter checks for relay, host, viewer, browser, and
  preflight outputs;
- role-scoped LAN role-filter checks for relay, host, and viewer.

The missing default coverage is the exact per-role LAN text snippets. That is
important for MVP handoff because the command kit supports `--only` output, and
operators may run default readiness before splitting commands across terminals.

## Goals / Non-Goals

**Goals:**

- Add default readiness plan steps for tokenized LAN relay, host, and viewer
  role-filter outputs.
- Use existing parser functions:
  `parseLanRelayRoleFilteredCommandReadiness` and
  `parseLanAgentRoleFilteredCommandReadiness`.
- Preserve bounded diagnostics and secret-safe output.
- Keep role-scoped readiness behavior unchanged.

**Non-Goals:**

- No new command-kit options.
- No runtime process startup, LAN probing, IP detection, firewall changes,
  browser launch, relay socket binding, native capture, OS input, services,
  startup persistence, elevation, unattended access, or hidden behavior.
- No raw token command-line support.

## Decisions

1. Add default plan steps instead of changing role-scoped plans.
   - Rationale: role-scoped LAN coverage already exists; the default aggregate
     gate should close the remaining evidence gap.

2. Require token env on representative LAN role-filter commands.
   - Rationale: the command kit rejects LAN relay-host output without
     `--token-env`, and two-PC MVP should keep the relay token value out of
     generated command text.

3. Keep browser out of LAN role-filter expansion.
   - Rationale: the browser command targets the viewer local control surface,
     not the relay URL. Existing default browser, token browser, and ephemeral
     browser checks already cover that output.

## Risks / Trade-offs

- Adds three more non-executing subprocess checks to default readiness. This
  slightly increases runtime but improves confidence in the commands operators
  copy for a two-PC trial.
- The representative LAN address is fixed and not discovered. This is
  intentional: readiness validates rendering semantics without probing local
  networks or leaking actual addresses.
