## Context

`apps/agent-shell` already has a managed runtime, CLI parsing, consent workflow controls, status/control prompts, and explicit runtime methods for development `screen-frame` and `input-event` messages. Those runtime methods perform role, peer routing, active visible authorization, permission, audit-before-send, and redaction gates. The CLI currently exposes consent, lifecycle, status, and signal probe behavior, but not the new remote interaction runtime methods.

This change adds a non-native development CLI surface that can exercise the remote interaction path across real host/viewer processes. It remains a protocol exerciser, not a native Windows client.

## Goals / Non-Goals

**Goals:**

- Add bounded CLI options for one scheduled host development `screen-frame` send.
- Add bounded CLI options for one scheduled viewer development `input-event` send.
- Validate all CLI remote interaction inputs before runtime startup and fail closed through usage output.
- Reuse runtime remote interaction methods so authorization, routing, permission, audit, socket, and redaction gates stay centralized.
- Keep diagnostics metadata-only and update docs/tests for the non-native boundary.

**Non-Goals:**

- No native Windows Desktop Duplication, Windows Graphics Capture, `SendInput`, UIAccess, secure desktop interaction, viewer rendering UI, media codec, clipboard, file transfer, diagnostics collection, installer, service, startup persistence, unattended access, elevation, AV/EDR evasion, credential collection, keylogging, or Windows prompt bypass.
- No user-supplied arbitrary JSON input payloads or raw frame file reads in this change.
- No production UX. This is a deterministic development exerciser for the existing relay/runtime contract.

## Decisions

- **Dedicated role-scoped CLI options.** Host frame options are host-only; viewer input options are viewer-only. Cross-role use fails during argument parsing before relay connection. This matches existing CLI workflow boundaries.
- **Single scheduled send per process.** Each exerciser sends at most one message after a bounded delay. This keeps the surface simple and avoids building a streaming/capture loop before native capture and rate-control designs exist.
- **Structured options over arbitrary JSON.** Pointer and keyboard inputs are expressed as individual bounded flags rather than raw JSON. This avoids unknown fields, keylogging buffers, clipboard content, or other payload expansion through the CLI.
- **Built-in static frame source.** The initial host CLI frame uses caller-supplied base64 with bounded dimensions/format, or a small static generated PNG marker if no base64 is provided. The shell does not read screen pixels or files.
- **Runtime method reuse.** The CLI scheduler waits for observed active authorization id and calls `runtime.sendScreenFrame()` or `runtime.sendInputEvent()`. It does not use generic `send()` and does not reimplement authorization decisions.
- **Metadata-only observability.** CLI output reports only success/failure summary such as message kind and authorization state. It must not print raw frame data, pointer coordinates, button values, key values, modifiers, or raw input payloads.

## Risks / Trade-offs

- Development frame data may still contain sensitive content if supplied manually -> Validate size/format and never print or audit raw frame bytes; document that this is caller-supplied development data only.
- CLI input events could be mistaken for OS input injection -> Keep wording and implementation clear that host receipt is a redacted development observation only with no native side effects.
- Scheduled sends may fire after pause/revoke/expiration -> Runtime methods re-check current authorization immediately before socket write and fail closed.
- More CLI flags increase parser complexity -> Keep a compact set of exact options and focused tests for role, value, and mutual-exclusion behavior.
