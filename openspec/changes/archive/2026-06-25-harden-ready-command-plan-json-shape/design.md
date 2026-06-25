## Context

The ready helper reads `mvp:commands --json` only as readiness metadata. It
requires a non-executing session command plan and then checks fixed command
names plus selected relay/token references internally. It never prints the raw
generated command strings.

## Decision

Add a top-level shape guard for command-plan JSON:

- required fields: `ok`, `mode`, `nonExecuting`, `commands`
- optional field: `safety`
- `safety`, when present, must be an array of strings

Any other top-level key causes `parseCommandPlanReadiness()` to return `false`,
so the existing ready flow fails closed with bounded `exit-nonzero` metadata.

## Non-Goals

- No change to `mvp:commands` output generation.
- No change to command entry parsing beyond the current fixed-name checks.
- No surfacing of raw command strings, tokens, pairing codes, paths, stdout, or
  stderr into ready output.

## Safety Review

This change narrows accepted JSON metadata only. It does not spawn processes
outside existing ready checks, start relay/host/viewer/browser sessions, invoke
Windows capture, apply OS input, change authorization, persist audit data,
handle token values differently, install services, configure startup
persistence, elevate privileges, or bypass Windows prompts.
