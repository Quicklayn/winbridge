## Context

The ready helper invokes `mvp:smoke -- --json` without `--keep-artifacts`.
Normal success output contains `ok`, `checks`, and `artifacts: "cleaned"`.
Normal failure output contains `ok`, optional bounded `reason`, and `checks`.
The aggregate ready output never needs smoke paths, URLs, tokens, commands, or
raw child output.

## Decision

Add a strict top-level smoke JSON shape check before subcheck parsing:

- success accepts only `ok`, `checks`, and optional `artifacts`
- failure accepts only `ok`, optional `reason`, and `checks`
- `artifacts`, when present, must be exactly `cleaned`

Unexpected fields cause `parseSmokeReadiness()` to return `undefined`, so the
existing ready flow fails closed under the bounded `exit-nonzero` reason.

## Non-Goals

- No change to `mvp:smoke` output generation.
- No support for `--keep-artifacts` inside `mvp:ready`; ready continues to run
  smoke in default cleanup mode.
- No surfacing of smoke top-level raw fields into aggregate ready output.

## Safety Review

This change narrows accepted JSON metadata only. It does not touch Windows
capture, host OS input application, browser automation, relay behavior,
authorization transitions, token handling, audit persistence, services,
startup persistence, privilege elevation, unattended access, or Windows prompt
handling.
