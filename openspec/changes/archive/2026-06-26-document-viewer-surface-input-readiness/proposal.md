# Document viewer surface input readiness

## Summary

Align the MVP local viewer surface documentation and normative wording with the
implemented pointer/keyboard readiness gates.

## Motivation

The local viewer surface now exposes bounded `inputPointerReady` and
`inputKeyboardReady` status metadata and enables only the matching visible input
controls. The README and the first sentence of the readiness requirement still
describe the gate as "at least one granted input permission", which can make MVP
operators expect broad input enablement after any granted input permission.

## Safety Impact

This is a documentation/spec clarification only. It does not add capture,
input, auth, relay, installer, startup, service, token, log, privilege, or
Windows API behavior. The clarification reinforces consent-first behavior by
stating that local UI readiness is bounded per input kind and remains only an
affordance on top of runtime authorization.

## Non-Goals

- Do not change local viewer surface runtime behavior.
- Do not add unattended access, hidden sessions, stealth persistence, credential
  access, keylogging, AV/EDR evasion, Windows prompt bypass, or broader input
  capture.
- Do not change the MVP command kit output.
