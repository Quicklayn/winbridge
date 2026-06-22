# Change: Add MVP command request reason

## Why

The generated MVP viewer command requests screen and input permissions, but it does not include a request reason. The existing host consent prompt can show a validated reason, so the command kit should generate one by default to make host approval more informed during two-PC MVP trials.

## What Changes

- Add a bounded `--request-reason` option to the MVP command kit.
- Include a safe default request reason in the generated viewer command.
- Reject blank, untrimmed, oversized, control-character, format-control, or secret-bearing request reasons before rendering commands.
- Document that request reasons are consent metadata only and do not grant access.

## Safety Impact

Touches host-facing consent metadata and generated viewer launch commands. It does not add authentication, authorization bypass, hidden sessions, hidden capture, hidden input, unattended access, installer behavior, startup persistence, services, privilege elevation, credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or automatic process execution.

The reason improves host decision context only. Existing pairing, explicit host approval, visible-session state, grants, revocation, and audit gates remain authoritative.

## Non-Goals

- No production support ticket integration.
- No authentication or verified identity assertion.
- No change to agent-shell request-reason parsing or protocol schemas.
- No change to native capture, native input, relay routing, or command execution behavior.
