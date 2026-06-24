## Context

The ready helper parses the smoke checker's bounded JSON and copies only fixed
subcheck names, boolean `ok`, and optional `skipped` markers into aggregate
output. Accepting extra fields is unnecessary and makes malformed smoke output
look valid.

## Decision

Treat every smoke subcheck as a strict record with exactly:

- `name`
- `ok`
- optional `skipped`

Any extra property causes `parseSmokeReadiness()` to return `undefined`, so
`mvp:ready` fails closed under the existing `exit-nonzero` reason.

## Non-Goals

- No change to smoke command execution.
- No change to subcheck names or aggregate JSON output format.
- No surfacing of raw smoke reasons, stdout, stderr, commands, paths, tokens,
  input commands, or frame/audit metadata.

## Safety Review

This change narrows accepted metadata only. It does not touch Windows capture,
host OS input application, browser automation, relay behavior, authorization
state transitions, token handling, services, startup persistence, privilege
elevation, unattended access, or Windows prompt handling.
