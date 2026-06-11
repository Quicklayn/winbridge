# Block Direct Send After Disconnect

## Why

The agent shell already suppresses delayed host workflow messages after receiving `peer-disconnected`, but the public managed runtime `send()` method can still emit direct outbound protocol messages while the remote peer is known to be disconnected. The relay rejects those messages because no recipient remains, but the local runtime still reports them as sent.

Fail-closing direct sends after a relay-observed disconnect keeps the managed runtime state coherent and prevents post-disconnect test or tool calls from creating misleading sent events.

## What Changes

- Track the existing remote peer disconnected state in the public `send()` path.
- Reject direct `runtime.send()` calls after `peer-disconnected` is recorded.
- Ensure no local `sent` runtime event is emitted for blocked post-disconnect sends.
- Add focused integration coverage and update docs/specs.

## Safety Impact

This change touches the non-native agent shell managed runtime and peer disconnect behavior. It does not add capture, input, clipboard, file transfer, installer behavior, startup persistence, services, tokens, logs, privilege elevation, or native Windows APIs.

The change is fail-closed: once the relay reports the remote peer is disconnected, direct sends are blocked locally.

## Non-Goals

- No reconnect semantics.
- No multi-peer or session replacement behavior.
- No relay forwarding rule changes.
- No native Windows host UI, capture, input, clipboard, or file-transfer work.

## Modified Capability

- `agent-shell-consent-workflow`

