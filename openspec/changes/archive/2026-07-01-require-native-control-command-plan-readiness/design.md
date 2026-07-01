## Context

The command kit prints the MVP session commands and its JSON mode is explicitly
non-executing. Current readiness parsing verifies fixed command names, relay
URL shape, token-env references, consent timeout, host control surface, audit
summary, and Windows control smoke preflight references.

The generated host and viewer commands already include the concrete native MVP
markers:

- host: `--host-apply-input 'true'`
- host: `--dev-screen-frame-source 'windows-capture'`
- viewer: `--request 'screen:view,input:pointer,input:keyboard'`
- viewer: `--viewer-screen-frame-output 'frames\latest.jpg'`

The missing design contract is making `mvp:ready` reject command-plan JSON if
those markers are missing, duplicated, or changed.

## Goals / Non-Goals

**Goals:**

- Add fail-closed command-plan validation for the reviewed native host/viewer
  path.
- Apply the same validation to default, LAN, token, and ephemeral command-plan
  checks.
- Keep failure output bounded and avoid echoing generated command strings or
  sensitive values.
- Keep the implementation parser-only; readiness continues to call the
  non-executing command kit JSON mode.

**Non-Goals:**

- No new runtime command generation options.
- No native capture, native input, browser, relay, socket, HTTP listener,
  service, startup, installer, elevation, unattended access, keylogging,
  credential access, clipboard access, prompt bypass, or hidden-session
  behavior.
- No execution of the generated MVP command plan.

## Decisions

1. Validate exact reviewed fragments by occurrence count.
   - Rationale: command generation quotes arguments deterministically, so exact
     fragments catch missing, duplicated, or changed native control markers
     without parsing PowerShell.
   - Alternative considered: build a PowerShell lexer. Rejected because the
     command kit output is deterministic and tightly scoped, while a lexer
     would add broad parsing surface for little benefit.

2. Validate both host and viewer sides in one helper.
   - Rationale: the MVP control path is only coherent when host capture/input
     and viewer request/frame-output markers are present together.

3. Reuse existing readiness failure behavior.
   - Rationale: existing failures report only check name and fixed reason
     metadata, which keeps generated commands, local paths, URLs, pairing
     codes, and token references out of diagnostics.

## Risks / Trade-offs

- Exact string checks can fail after intentional command formatting changes.
  That is acceptable for a reviewed readiness gate: formatting changes to
  native capture/input command fragments should update tests and OpenSpec
  together.
- This does not prove a live Windows machine can capture or inject input; that
  remains covered by native preflight and explicit smoke gates. This change
  proves the printed two-PC command plan still targets the reviewed MVP path.
