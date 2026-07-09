## Context

`mvp:trial` is the operator-facing checklist for a development two-PC MVP
trial. The viewer section already contains a `print-browser-command` step that
delegates to `mvp:commands -- --only browser`, but there is no narrow
`mvp:trial -- --role browser` mode for the operator who only needs the
loopback viewer-surface instruction.

## Goals / Non-Goals

**Goals:**

- Add a fixed `browser` trial section.
- Accept `--role browser` in plan mode and JSON mode.
- Keep the browser section non-executing and tied to the existing viewer
  readiness reminder and command-kit browser block.
- Preserve existing relay, host, viewer, evidence, and full-plan behavior.

**Non-Goals:**

- No browser launch, runtime startup, socket binding, capture, input, audit-file
  writes, LAN probing, relay discovery, installer work, startup persistence, or
  privilege elevation.
- No production desktop viewer UI or browser automation.
- No changes to command-kit browser command generation.

## Decisions

1. Add `browser` to the trial role list instead of creating a new flag.

   This matches the existing `mvp:commands -- --only browser` shape and keeps
   operator workflows role-filtered by machine/task.

2. Render the browser trial section as a command-reference wrapper.

   The new section will point to `mvp:ready -- --role viewer` and
   `mvp:commands -- --only browser` rather than duplicating generated browser
   commands. This keeps validation concentrated in the command kit.

3. Keep `--evidence` separate from role filtering.

   Evidence mode already has stricter audit-path arguments and remains mutually
   exclusive with all role filters, including `browser`.

## Risks / Trade-offs

- Operators may think the browser role starts a browser automatically ->
  Mitigation: output keeps the existing non-executing safety metadata and
  explicit operator-check text.
- Another role increases plan surface area -> Mitigation: tests verify full,
  JSON, role-filtered, and malformed option behavior.
