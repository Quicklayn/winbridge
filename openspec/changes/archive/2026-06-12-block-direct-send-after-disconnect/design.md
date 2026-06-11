# Design: Block Direct Send After Disconnect

## Current Behavior

`peer-disconnected` sets `sessionState.remotePeerDisconnected = true`. Delayed host workflow timers call `canSendDelayedHostWorkflow()` and suppress later revoke, pause, resume, termination, expiration, state, control, permission, and audit workflow messages.

The public `runtime.send(message)` path does not check this state. A test or exerciser can therefore call `send()` after disconnect, causing a local `sent` event even though the relay has no recipient.

## Proposed Behavior

Add a small guard to the public `send()` implementation:

```text
if remotePeerDisconnected:
  throw Error("Agent shell peer is disconnected")
```

The guard runs before `sendProtocol()`, so blocked post-disconnect sends do not emit a local `sent` event and do not write to the socket.

## Security Rationale

Disconnect means the known remote peer is no longer present. Sending new messages after that point cannot produce legitimate assistance and can create confusing local telemetry. Blocking direct sends keeps disconnect state fail-closed and aligns public test/runtime APIs with delayed workflow suppression.

The guard does not authorize, activate visibility, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent.

## Alternatives Considered

- Keep relying on relay rejection: rejected because the runtime has enough local state to fail before emitting misleading `sent` events.
- Close the socket immediately on peer disconnect: rejected for now because existing tests and future diagnostics may still inspect the runtime after receiving the disconnect notice.

