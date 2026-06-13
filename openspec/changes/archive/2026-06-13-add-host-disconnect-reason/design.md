## Context

Host local disconnect simulation closes the host relay WebSocket only after active or paused visible authorization. The relay remains responsible for notifying the viewer with a bounded `peer-disconnected` notice. The current close reason is fixed to `Host disconnect simulation`, and runtime close events expose only redacted reason text plus byte length.

## Goals / Non-Goals

**Goals:**

- Allow host local disconnect simulation to use an explicit bounded reason through CLI and direct runtime options.
- Reuse existing canonical workflow reason validation and additionally cap the UTF-8 close reason to the WebSocket close-frame reason budget.
- Keep the reason out of audit records, protocol messages, logs, and local runtime event payloads except for existing byte-length diagnostics on closed events.
- Preserve all existing visibility, active/paused authorization, audit-failure, local-disconnect, remote-disconnect, and no-forged-notice gates.

**Non-Goals:**

- No new protocol field or relay forwarding behavior.
- No viewer-controlled disconnect reason.
- No production account identity, reconnect, native Windows UI, capture, input, clipboard, file transfer, installer, service, startup, token, or privilege behavior.
- No change to audit record detail schema beyond keeping disconnect records reason-free.

## Decisions

1. Reuse workflow reason validation, then add the WebSocket close-frame byte bound.

   Local disconnect reasons are operator-provided lifecycle metadata, and the existing workflow reason rules already reject blank, padded, oversized, control-character, and bidi/zero-width-control values. A WebSocket close reason also has a smaller transport budget, so the runtime and CLI cap the UTF-8 byte length at 123 bytes before any connection can open or close.

   Alternative considered: allow any canonical 240-character workflow reason and catch `socket.close` failures. Rejected because a too-long close reason should fail before relay connection or workflow execution, not during the host disconnect path.

2. Use the reason only for the local WebSocket close frame.

   The disconnect audit record continues to store `cause: "local-disconnect"` and bounded authorization metadata. Close-event consumers receive redacted reason text with byte length only.

   Alternative considered: store sanitized reason text in audit details. Rejected for this increment because audit records should not retain operator free text unless there is a stricter product requirement and review gate.

3. Scope CLI support to host disconnect simulation.

   `--disconnect-reason` is accepted only for host runtimes and does not make disconnect valid without visible active or paused authorization. Viewer local disconnect remains reasonless because it is a local leave path, not host session control.

## Risks / Trade-offs

- [Risk] A future caller treats disconnect reason text as an authorization signal. -> Mitigation: do not add protocol fields, audit reason detail, or lifecycle-state mutation; keep it local close metadata only.
- [Risk] Raw reason text appears in runtime events or audit files. -> Mitigation: existing closed-event redaction exposes byte length only; focused tests assert audit/log/event surfaces do not contain the raw marker.
- [Risk] A valid lifecycle reason exceeds WebSocket close reason limits. -> Mitigation: add a 123 UTF-8 byte bound during CLI and runtime option validation.
- [Risk] The option could imply host disconnect is available before consent. -> Mitigation: all existing visible active/paused authorization gates remain unchanged and are covered by existing tests.
