## Context

The command kit already validates a full MVP session plan and prints separate
relay, host, viewer, and browser blocks. In a two-PC trial, each operator still
has to locate and copy the relevant block from the full output. The helper is
non-executing, so a role filter can improve usability without adding runtime
capability.

## Goals / Non-Goals

**Goals:**

- Add a fixed target filter for text command output.
- Keep all existing option validation before any filtered command is rendered.
- Preserve the default full plan and JSON session output shape used by
  readiness validation.
- Keep filtered output bounded and explicit that commands are manual.

**Non-Goals:**

- No automatic process launch.
- No remote host discovery, network probing, or firewall configuration.
- No changes to relay, capture, input, authorization, audit, native Windows
  adapters, services, startup behavior, or privilege model.
- No production deployment workflow.

## Decisions

- Use a single `--only <target>` flag with fixed values `relay`, `host`,
  `viewer`, `browser`, and `preflight`.
  - Rationale: the option describes output filtering rather than a runtime
    role, and fixed values keep validation simple.
  - Alternative considered: separate scripts per machine. That would duplicate
    validation and increase drift from the reviewed command kit.
- Keep `--only` text-only and incompatible with `--json`.
  - Rationale: `mvp:ready` validates the existing bounded JSON command plan;
    changing JSON shape is unnecessary for operator usability.
  - Alternative considered: JSON filtering. Deferred until an automation
    consumer needs it.
- Treat `--only preflight` as the same bounded preflight text workflow as
  `--preflight-only`.
  - Rationale: it gives users one predictable filter vocabulary while
    preserving the existing preflight-only flag.

## Risks / Trade-offs

- Filtered output might hide context from an operator.
  - Mitigation: include a short safety/preflight reminder and current relay URL
    in every filtered session block.
- Another option increases CLI surface area.
  - Mitigation: accept only fixed values, reject duplicates/incompatible flags,
    and cover the parser with tests.
