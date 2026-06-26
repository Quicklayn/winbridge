# Change: Add explicit tokenized smoke readiness aggregation

## Why
The root smoke helper can now verify the token-protected local relay path, but
`mvp:ready` cannot aggregate that check. Operators need a single bounded
readiness command before a shared-token MVP trial without making tokenized
smoke an unexpected default requirement.

## What Changes
- Add an explicit `--include-token-smoke` flag to `npm run mvp:ready`.
- When present in default aggregate mode, run
  `npm run mvp:smoke -- --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
  after the existing default and optional smoke checks.
- Keep role-scoped readiness incompatible with smoke execution.
- Keep readiness output bounded and secret-safe.

## Safety Impact
- Touches readiness orchestration for a token/auth smoke path.
- Does not change relay, host, viewer, capture, input, or authorization
  runtime behavior.
- Does not print token values, environment values, child command text, stdout,
  stderr, child output, relay URLs, pairing codes, credentials, screen
  contents, input contents, or full secrets.

## Non-Goals
- No production auth changes.
- No token generation or persistence.
- No default execution of tokenized smoke.
- No Windows capture, OS input, browser automation, service, startup,
  privilege elevation, unattended access, AV/EDR evasion, Windows prompt
  bypass, or hidden-session behavior.

