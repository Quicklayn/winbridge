# Proposal: Clarify MVP Startup Capability Log

## Why

The agent shell startup log still says viewer desktop rendering and remote input
are not implemented. The development MVP now has a loopback viewer surface and
explicit host input application path, so that wording is misleading during
two-PC trials.

## What Changes

- Replace the stale startup capability message with bounded wording that points
  to the available development MVP viewer surface and explicit input path.
- Keep the log metadata-only and non-authorizing.
- Cover the startup log with a focused runtime test.

## Safety Impact

This change only updates informational startup diagnostics. It does not start
viewer surfaces, capture, input, browser, relay, services, persistence,
elevation, unattended access, or prompt bypass.

## Non-Goals

- Do not add a production desktop UI.
- Do not widen capture, input, consent, visibility, revocation, or audit gates.
