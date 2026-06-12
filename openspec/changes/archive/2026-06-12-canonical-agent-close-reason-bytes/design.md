## Context

The managed agent shell emits a local `closed` event and disconnect log when the WebSocket closes. The raw close reason is redacted, and only summary metadata is exposed.

The current implementation derives `reasonBytes` with `reason.length`. In the `ws` close callback, the reason may be a `Buffer`; in other compatible callback shapes it may be text. For text containing multi-byte characters, character length is not byte length. Since the field is named and specified as byte metadata, the runtime should calculate bytes explicitly.

## Goals / Non-Goals

**Goals:**

- Keep raw WebSocket close reason text redacted from events and logs.
- Calculate `reasonBytes` as UTF-8 byte length for close reason text and as buffer byte length for buffer reasons.
- Add regression coverage with a multi-byte private close reason.

**Non-Goals:**

- No change to the `closed` event shape, close code handling, disconnect lifecycle, host indicator state, relay behavior, or protocol envelopes.
- No new capture, input, clipboard, file transfer, diagnostics, reconnect, installer, startup, service, token, privilege, native Windows, or hidden session behavior.

## Decisions

### Add a small close reason byte helper

The close handler will call a local helper that accepts the close reason value and returns byte length. Buffers use `.byteLength`; strings use `Buffer.byteLength(reason, "utf8")`.

Rationale: this makes the metadata contract explicit and avoids relying on `.length` semantics.

Alternative considered: inline `Buffer.byteLength(reason.toString("utf8"), "utf8")`. That works for `Buffer`, but a helper keeps the type boundary clearer and easier to test through integration behavior.

### Keep redaction unchanged

The runtime continues to emit `reason: "[REDACTED]"` and logs only `reasonBytes`.

Rationale: close reasons can contain tokens, private paths, parser details, or user-controlled text. Byte count is useful diagnostics without exposing content.

## Risks / Trade-offs

- Some close reason values are already buffers -> use `.byteLength` to avoid double conversion.
- Test close reason length limits are bounded by WebSocket protocol -> use a short multi-byte string.
- This touches logs/events -> require focused security review.

## Migration Plan

No migration is required. Existing event consumers still receive `direction`, `code`, `reason`, and `reasonBytes`.

## Open Questions

None.
