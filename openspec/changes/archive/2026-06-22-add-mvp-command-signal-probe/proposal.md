# add-mvp-command-signal-probe

## Summary

Include the existing consent-bound development signal probe in the generated MVP
session command plan.

## Motivation

The agent shell already supports a viewer signal probe and host acknowledgement
that verify the active visible `screen:view` authorization path without sending
screen, input, clipboard, file-transfer, diagnostic, SDP, or ICE payloads. The
MVP command kit should print those reviewed options by default so a two-PC trial
has an early readiness signal before relying on browser pointer control.

## Scope

- Add a bounded command-kit option for viewer signal probe delay.
- Render host commands with explicit host signal probe acknowledgement enabled.
- Render viewer commands with the configured viewer signal probe delay.
- Document that the probe is readiness metadata only and non-authorizing.
- Keep the command kit non-executing and development-scoped.

## Non-Goals

- No new runtime signal behavior.
- No protocol changes.
- No screen capture, input, relay, native Windows, or viewer surface changes.
- No background process orchestration.
