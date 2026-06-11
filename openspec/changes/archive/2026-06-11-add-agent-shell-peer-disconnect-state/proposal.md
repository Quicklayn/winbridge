## Why

The relay now sends schema-valid `peer-disconnected` lifecycle messages, but the non-native agent shell only logs received protocol messages generically. If the viewer disconnects while the host shell has delayed revoke, pause, resume, termination, or expiration timers scheduled, those timers can still emit workflow messages to the relay even though the peer has already left.

The shell should treat peer disconnect as a terminal remote-peer lifecycle signal for the current development session so future native clients inherit a fail-closed pattern.

## What Changes

- Track remote peer disconnect state inside the agent shell runtime after receiving `peer-disconnected`.
- Include peer id, role, and bounded reason code in the safe protocol summary log for disconnect notices.
- Suppress delayed host workflow simulation messages after remote peer disconnect.
- Add integration tests proving viewer-visible host disconnect handling and host suppression of delayed workflow messages after viewer disconnect.
- Document the agent shell disconnect lifecycle behavior and safety boundary.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Adds peer disconnect state handling for the non-native consent workflow exerciser.

## Impact

- Affected code: `apps/agent-shell`, docs, OpenSpec specs, and focused tests.
- Safety impact: strengthens fail-closed behavior after disconnect and prevents stale workflow simulation messages.
- Touches user-visible workflow logs and session lifecycle behavior; requires security review.
- Non-goals: relay protocol changes, reconnect policy, screen capture, input injection, clipboard sync, file transfer, installer behavior, service registration, startup persistence, credential access, privilege elevation, hidden sessions, or Windows prompt bypass.
