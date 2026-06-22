# Change: Add MVP command display names

## Why

The MVP command kit currently relies on agent-shell default display names, which are process-id based and less useful during a real host consent prompt. The host should see a clear bounded viewer display name before approving a session, and generated commands should make that explicit.

## What Changes

- Add bounded `--host-name` and `--viewer-name` options to the MVP command kit.
- Print safe default display names in generated host and viewer commands.
- Reject blank, untrimmed, oversized, control-character, format-control, or secret-bearing display names before rendering commands.
- Document that display names are host-facing development metadata and not authentication.

## Safety Impact

Touches user-visible MVP launch commands and host-facing consent metadata. It does not add authentication, authorization bypass, hidden sessions, hidden capture, hidden input, unattended access, installer behavior, startup persistence, services, privilege elevation, credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or automatic process execution.

Display names improve consent prompt clarity only. Authorization remains controlled by pairing, explicit host approval, visible session state, grants, revocation, and audit gates.

## Non-Goals

- No production account identity.
- No verified trust indicator.
- No change to agent-shell runtime display-name validation.
- No change to native capture, native input, relay routing, or protocol schemas.
