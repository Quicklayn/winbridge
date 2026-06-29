# Design

## Ready Plan

Add a `token-role-filter-preflight-command` step to the default aggregate ready
plan after the existing token preflight JSON validation and near the existing
role-filter checks. The step runs:

`mvp:commands -- --only preflight --token-env WINBRIDGE_RELAY_SHARED_TOKEN`

This remains text-only and non-executing.

## Parser

Add a preflight-specific token-env role-filter parser that composes the
existing preflight role-filter marker validation with checks for:

- `$env:WINBRIDGE_RELAY_SHARED_TOKEN`;
- the bounded guidance phrase that the token value is referenced through the
  environment and not printed;
- absence of raw token literals and runtime `--token` arguments.

The existing preflight role-filter forbidden markers continue to reject relay,
host, viewer, browser, capture, input, and runtime command blocks.

## Non-Goals

- No changes to runtime session commands.
- No changes to smoke execution.
- No native Windows capture/input changes.
