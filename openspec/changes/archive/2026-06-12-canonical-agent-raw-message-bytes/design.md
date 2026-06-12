## Context

The agent shell receives WebSocket messages from the relay and currently calls `data.toString()` before protocol parsing. When parsing fails or a decoded message is ignored as unsafe, local events/logs expose only redacted text and byte-length metadata.

The byte-length metadata currently comes from the converted text. That is accurate for ordinary UTF-8 text, but not for binary payloads or invalid UTF-8 sequences because replacement characters can change the encoded byte length.

## Goals / Non-Goals

**Goals:**

- Measure inbound WebSocket payload bytes before converting to text.
- Preserve existing protocol parsing and unsafe-message handling behavior.
- Keep raw inbound contents redacted in events and logs.
- Add binary non-protocol regression coverage.

**Non-Goals:**

- No change to relay wire protocol, protocol schemas, event shapes, authorization gates, consent workflow behavior, or disconnect lifecycle.
- No new capture, input, clipboard, file transfer, diagnostics, reconnect, installer, startup, service, token, privilege, native Windows, or hidden session behavior.

## Decisions

### Normalize inbound WebSocket data once

The message handler will convert `RawData` into `{ text, byteLength }` before parsing. `byteLength` is calculated from the original raw payload, while `text` is used only for the existing protocol parsing path.

Rationale: this preserves behavior for valid protocol text while making raw diagnostics accurate for non-text or invalid UTF-8 input.

Alternative considered: keep calculating `Buffer.byteLength(text)`. That is simpler but keeps inaccurate metadata for binary payloads.

### Reuse relay-style RawData helpers

The agent shell will use local helpers equivalent to the relay's `rawDataByteLength` and `rawDataToString` behavior, including Buffer arrays.

Rationale: this keeps WebSocket boundary handling consistent across relay and agent-shell code without adding a shared dependency for two small helpers.

## Risks / Trade-offs

- Binary input still gets converted to text for parse failure handling -> raw content remains redacted, and byte metadata comes from the original bytes.
- Helper duplication with relay exists -> acceptable for now because scopes are small and no new shared API is needed.
- This touches local logs/events -> require focused security review.

## Migration Plan

No migration is required. Event consumers keep receiving the same `raw` event shape with more accurate `byteLength` metadata.

## Open Questions

None.
