## Why

The MVP two-PC workflow now has a command kit and a local smoke check, but
`mvp:doctor` only verifies scripts and workspace manifests. A user can still
reach the manual trial with a missing relay, agent, or native adapter entrypoint
and fail later with noisy process errors.

## What Changes

- Extend `mvp:doctor` with a non-executing entrypoint file check for the MVP
  relay, agent shell, protocol, audit log, Windows capture, and Windows input
  modules.
- Keep doctor output bounded to fixed readiness lines or fixed reason codes.
- Keep doctor strictly local and passive: no relay, host, viewer, browser,
  capture, input, services, startup persistence, or unattended access.

## Safety Impact

This change reduces late MVP startup failures without adding remote capability.
It does not touch authorization, relay message forwarding, capture, input,
installer, startup, services, tokens, logs, or privilege elevation. Failure
output remains metadata-only and does not expose local paths, tokens, pairing
codes, screen contents, keystrokes, or credentials.

## Non-Goals

- Starting or orchestrating the MVP session.
- Performing Windows capture or OS input.
- Adding browser automation.
- Installing services, persistence, elevation, or unattended access.
