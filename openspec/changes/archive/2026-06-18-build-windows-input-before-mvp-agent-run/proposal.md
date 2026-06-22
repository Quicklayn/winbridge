# Change: Build Windows input before MVP agent runs

## Summary

Ensure the root `npm run dev:agent` helper builds the Windows input workspace before starting agent-shell. The MVP command kit prints host commands that enable `--host-apply-input true`, and agent-shell imports `@winbridge/windows-input` through that path.

## Motivation

The development MVP workflow should be runnable from a fresh checkout after dependency installation without requiring the operator to know which internal workspaces must be built first. The root agent helper already builds protocol and Windows capture packages; it should include the Windows input package now that the generated MVP host command depends on it.

## Scope

- Update the root `dev:agent` script to build `@winbridge/windows-input`.
- Add a focused regression test proving the generated MVP workflow's root agent helper builds the input dependency.
- Update the MVP command kit spec with this run-readiness requirement.

## Non-Goals

- No change to runtime authorization, capture, input, relay, pairing, or audit semantics.
- No automatic process spawning or hidden session behavior.
- No production installer or service startup behavior.
