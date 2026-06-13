## Context

Display names are local-development identity metadata, not authentication. They are still user-visible: the agent shell can place them in prompts, runtime events, and logs, and the relay validates/forwards `hello` messages that include display names. Existing schemas reject blank, untrimmed, and oversized values, but allow ASCII control characters.

## Goals / Non-Goals

**Goals:**

- Reject ASCII control characters in the shared protocol display-name schema.
- Ensure CLI `--name`, direct runtime display names, inbound `hello`, public-send `hello`, and legacy consent request display names inherit the same validation.
- Keep diagnostics generic and non-authorizing.

**Non-Goals:**

- No production identity or account trust changes.
- No screen capture, input, clipboard, file transfer, diagnostics, reconnect, installer, service, startup, privilege elevation, or Windows prompt behavior.
- No locale/script restrictions beyond ASCII control-character rejection.

## Decisions

- Centralize the rule in `DeviceDisplayNameSchema` so device identity, `hello`, legacy consent, agent CLI parsing, and managed runtime option validation share one contract.
- Reject only ASCII control characters for this increment. This blocks terminal/control-sequence ambiguity while avoiding accidental exclusion of valid human names in non-Latin scripts.
- Keep current length semantics at 120 characters. Byte-size limits are left to a future display-name/UI policy if native Windows surfaces need stricter layout constraints.
- Keep existing bounded errors. Agent usage errors and runtime validation errors should not echo raw display-name values.

## Risks / Trade-offs

- Existing local scripts using control characters in `--name` will fail. Mitigation: this is invalid user-visible metadata and failure happens before relay connection or protocol send.
- Some Unicode formatting characters remain allowed. Mitigation: this increment targets ASCII control characters only; broader Unicode spoofing policy needs a separate spec because it can affect legitimate names.
- The shared schema change affects multiple protocol messages. Mitigation: add focused protocol, CLI, and runtime tests and run the full repo verification.
