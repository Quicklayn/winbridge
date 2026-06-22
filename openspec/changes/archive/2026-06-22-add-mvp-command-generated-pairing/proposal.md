# Proposal: Add Generated Pairing to MVP Command Kit

## Why

The MVP command kit defaults to the development pairing code `123-456`. That is
acceptable for deterministic local tests, but a real two-PC trial should be easy
to run with a fresh bounded pairing code without manually inventing one.

## What Changes

- Add `--generate-pairing` to `npm run mvp:commands`.
- Generate a fresh `NNN-NNN` pairing code for the printed host and viewer
  commands.
- Support generated pairing in text and JSON output.
- Reject `--generate-pairing` combined with explicit `--pairing`.

## Safety Impact

The command kit remains non-executing and development-scoped. It only prints
commands. Generated pairing does not authenticate production users by itself and
does not bypass host consent, visible session state, permission grants,
revocation, or audit requirements.

## Non-Goals

- Do not start relay, host, viewer, browser, capture, or input.
- Do not add production account authentication.
- Do not weaken host consent, visible session, revocation, or audit gates.
