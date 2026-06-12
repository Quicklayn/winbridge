## Why

Audit reason redaction now blocks obvious caller-provided secrets, but its marker
matching can over-redact safe fixed diagnostic reasons that contain words such as
`token` without carrying a token value. That weakens audit usefulness for bounded
relay/runtime diagnostics.

## What Changes

- Preserve known safe bounded audit reason strings even when they include
  security-domain words.
- Keep redacting reason text that contains obvious secret-bearing marker/value
  forms such as raw tokens, authorization headers, credentials, private keys,
  pairing codes, keystrokes, screenshots, or screen data.
- Add regression tests for safe bounded relay token reasons and unsafe
  caller-provided token reasons.
- Non-goal: this does not permit raw exception messages, raw close reasons, raw
  protocol payloads, tokens, pairing codes, credentials, screen contents, or
  input contents in audit output.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `audit-log-persistence`: safe bounded audit reasons must remain inspectable
  while unsafe reason text remains redacted.

## Impact

- Affected code: `packages/protocol/src/audit.ts`,
  `packages/protocol/src/audit.test.ts`.
- Affected specs/docs: `openspec/specs/audit-log-persistence/spec.md`.
- Touches audit/log behavior only. No capture, input, relay authority, installer,
  startup, service, credential access, or privilege elevation changes.
