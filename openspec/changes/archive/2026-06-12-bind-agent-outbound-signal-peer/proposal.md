## Why

The agent shell now gates public `signal` sends on active visible authorization, but caller code can still construct a `signal` envelope whose `fromPeerId` does not match the local runtime peer or whose explicit `toPeerId` points back to the same peer. The development relay rejects spoofed sender and wrong-target messages, but the managed runtime should also fail closed before socket write and before local `sent` event emission.

## What Changes

- Validate public runtime `signal` envelopes against the local runtime peer before authorization and transport write.
- Reject `signal` sends when `fromPeerId` is not the local `peerId`.
- Reject explicit `signal.toPeerId` values that do not match the authorized remote peer, including local self-targets and third-peer targets.
- Keep blocked diagnostics generic and secret-safe, with no raw signal payload, token, pairing code, or private metadata exposure.
- Update the `agent-shell-consent-workflow` spec for outbound signal peer binding.
- Non-goals: do not implement screen capture, remote input, clipboard sync, file transfer, WebRTC media, native Windows UI, services, startup persistence, credential access, or production authentication.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: add local outbound `signal` peer binding before public runtime socket writes and `sent` events.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and focused runtime integration tests.
- Affected docs/specs: `agent-shell-consent-workflow`.
- Security impact: touches authorization and local send-path checks for signal messages; requires security review.
- External API impact: low-level `AgentShellRuntime.send()` rejects malformed local signal routing that is not bound to the local runtime peer and authorized remote peer.
- Dependencies: no new runtime dependencies.
