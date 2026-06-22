## Context

The agent shell already validates, sends, receives, audits, and redacts
`input-event` envelopes as development protocol observations. The
`@winbridge/windows-input` package now provides a Windows-only native adapter
that can apply one protocol-supported input event after a caller supplies an
active visible connected grant snapshot. The missing MVP increment is host
runtime wiring that connects the already accepted inbound event to that adapter
without weakening consent, visibility, revoke, or audit boundaries.

## Goals / Non-Goals

**Goals:**

- Add explicit host opt-in to apply inbound pointer/keyboard events through the
  Windows input adapter.
- Invoke native input only after inbound runtime authorization checks have
  accepted the event and metadata-only local audit has succeeded.
- Keep all diagnostics, runtime events, logs, and audit details redacted from
  raw input contents.
- Preserve fail-closed behavior after pause, revoke, terminate, expiration,
  disconnect, invisible approval, missing permission, audit failure, adapter
  failure, or platform mismatch.

**Non-Goals:**

- No production host or viewer UI.
- No continuous viewer control surface beyond the existing development
  `input-event` sender.
- No clipboard, file transfer, diagnostics, remote shell, keylogging, input
  capture, services, startup persistence, installer behavior, elevation,
  AV/EDR evasion, unattended access, or Windows prompt bypass.

## Decisions

1. Keep host input application disabled by default.

   The runtime will require an explicit host-only option and the CLI will expose
   a boolean opt-in. This prevents old host runs from gaining native input
   behavior just because a viewer requests `input:pointer` or `input:keyboard`.

2. Require local audit before native input.

   The existing inbound authorization gate decides whether an input event is
   trusted enough to emit as a local received event. Native input is a further
   side effect, so the host writes a metadata-only audit record before invoking
   the adapter. Audit failure blocks adapter invocation.

3. Reconstruct a minimal adapter grant from runtime state.

   The adapter remains independent of agent-shell internals. The host runtime
   supplies only the active authorization id, status, visible flag, permissions,
   peer connectivity state, and expiry already required by the adapter.

4. Keep diagnostics generic.

   Adapter failures, audit failures, malformed input, and platform mismatch are
   surfaced as bounded generic runtime errors. No pointer coordinates, button
   values, keys, modifiers, raw payloads, command output, tokens, pairing codes,
   credentials, or private reasons are exposed.

## Risks / Trade-offs

- Native input can be abused if it runs outside consent -> mitigation: disabled
  by default, host-only, accepted-inbound authorization gate, adapter grant gate,
  audit-before-native-input, and tests for stale authorization.
- Audit persistence can become availability-sensitive -> mitigation: fail
  closed, matching existing sensitive-action audit ordering.
- The development CLI still lacks a real viewer UI -> mitigation: this change
  enables the first host OS input path while keeping viewer UX as future work.
