## Context

The agent shell already transports `input-event` messages after consent-bound
authorization, but host runtimes currently treat inbound input as metadata-only
observations. Before host runtime wiring can apply those events, WinBridge needs
a small adapter boundary that is independently testable, fail-closed, and free
of import-time side effects.

## Goals / Non-Goals

**Goals:**

- Add a Windows-only input adapter package with an injectable runner.
- Validate active visible unexpired grants and required permissions immediately
  before native input invocation.
- Map protocol pointer and keyboard events into bounded native runner requests.
- Reject malformed, unsupported, stale, disconnected, invisible, or
  permissionless input before runner invocation.
- Keep runner errors sanitized and avoid exposing raw input details.

**Non-Goals:**

- No agent-shell runtime wiring.
- No CLI option to apply inbound input.
- No hidden input, unattended access, services, startup persistence, installer
  behavior, elevation, AV/EDR evasion, or Windows prompt bypass.
- No keylogging, input capture, clipboard, file transfer, diagnostics, or remote
  shell.

## Decisions

1. Use an injectable runner first.

   Tests must prove grant and event gating without invoking native OS input. The
   production default runner can be a narrow PowerShell/C# `SendInput` command,
   but unit tests use an injected runner and assert it is not called on blocked
   paths.

2. Keep the adapter package independent from agent-shell state.

   The adapter accepts a grant snapshot plus one input event. Runtime code will
   later construct the grant only after inbound consent gates pass.

3. Normalize only protocol-supported input events.

   Pointer events use normalized coordinates from the protocol and keyboard
   events use protocol-supported key names/modifiers. The adapter does not
   accept arbitrary key buffers, text strings, macro scripts, or raw command
   payloads.

## Risks / Trade-offs

- Native input is sensitive -> package scope stays small and runtime wiring is a
  later reviewed OpenSpec change.
- Keyboard events can be abused for credential entry -> the adapter sends only
  single protocol-supported key up/down events under an active grant and never
  captures keys or buffers text.
- The default runner is not a production input stack -> acceptable for MVP
  bootstrap; later hardening can replace it without weakening grant gates.
