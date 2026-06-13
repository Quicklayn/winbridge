## Context

Display names are local-development identity metadata, not authentication. They are still user-visible and can influence what an operator sees in prompts, runtime event streams, and logs. Existing schemas reject blank, untrimmed, oversized, and ASCII-control values, but allow Unicode bidirectional formatting controls such as right-to-left override and isolate markers.

## Goals / Non-Goals

**Goals:**

- Reject Unicode bidirectional formatting controls in the shared protocol display-name schema.
- Ensure CLI `--name`, direct runtime display names, inbound `hello`, public-send `hello`, and legacy consent request display names inherit the same validation.
- Keep rejection diagnostics generic, secret-safe, and non-authorizing.

**Non-Goals:**

- No production identity, account trust, authentication, or pairing semantic changes.
- No screen capture, input, clipboard, file transfer, diagnostics, reconnect, installer, service, startup, privilege elevation, or Windows prompt behavior.
- No Unicode script allowlist and no ban on ordinary right-to-left letters or non-Latin names.

## Decisions

- Centralize the rule in `DeviceDisplayNameSchema` so device identity, `hello`, legacy consent, agent CLI parsing, and managed runtime option validation share one contract.
- Reject only Unicode bidirectional formatting controls for this increment: U+061C, U+200E, U+200F, U+202A through U+202E, U+2066 through U+2069, and U+200B through U+200D / U+2060 zero-width format controls that commonly make names visually ambiguous in terminals or UI labels.
- Keep ordinary Unicode letters, including right-to-left script letters, accepted.
- Keep current length semantics at 120 characters and existing bounded errors. Agent usage errors and runtime validation errors should not echo raw display-name values.

## Risks / Trade-offs

- Existing local scripts using bidi or zero-width controls in `--name` will fail. Mitigation: these values are unsafe user-visible metadata and fail before relay connection or protocol send.
- The shared schema change affects multiple protocol messages. Mitigation: add focused protocol, CLI, and runtime tests and run the full repo verification.
- This does not solve every confusable Unicode issue. Mitigation: broader script-confusable policy requires UI design and localization work and remains out of scope.
