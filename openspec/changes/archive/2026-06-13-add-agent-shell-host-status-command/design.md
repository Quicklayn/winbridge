## Context

The non-native host control prompt is the current development surface for immediate host controls. It can invoke pause, resume, revoke, terminate, and disconnect, but it gives no read-only snapshot of the local host authorization/indicator state. Future native host work needs a visible status surface; this change adds a development-only status path that reuses existing runtime state instead of creating a new protocol message.

## Goals / Non-Goals

**Goals:**

- Add a read-only `status` command to the host control prompt.
- Expose a managed host status snapshot derived from local host authorization and indicator state.
- Keep output secret-safe and bounded to local lifecycle metadata.
- Prove the command does not invoke controls, write protocol messages, or alter authorization state.

**Non-Goals:**

- No native tray/window/status UI.
- No viewer status command.
- No new protocol message, relay behavior, account identity, MFA, production RBAC, capture, input execution, clipboard sync, file transfer, diagnostics, reconnect, installer, service, startup persistence, or privilege elevation.

## Decisions

1. **Use a runtime snapshot method.**
   - Add `getHostStatus()` to the managed runtime so CLI code does not inspect private session state or synthesize protocol-derived status itself.
   - The method is host-only and reads the same local authorization state used by host indicator events.
   - Alternative considered: have the prompt track indicator events. Rejected because prompt lifecycle can start after activation and should still report current state.

2. **Use bounded status metadata only.**
   - Snapshot fields: `state`, `visibleToHost`, `permissionCount`, and optional `authorizationId` / `authorizationStatus`.
   - The command does not print permission names, peer ids, display names, reasons, tokens, pairing codes, payload contents, or raw command text.
   - Alternative considered: print the full granted permission list. Rejected because count is enough for local status and avoids expanding visible sensitive metadata.

3. **Make `status` read-only.**
   - `status` does not call pause/resume/revoke/terminate/disconnect, does not call public `send()`, and does not write audit or protocol messages.
   - Status for terminal or invisible authorizations reports inactive local visibility and zero action-capable permissions even when an internal terminal snapshot exists.

## Risks / Trade-offs

- [Risk] Status output could be mistaken for authorization. -> Label it as local host status and keep remote action gates unchanged.
- [Risk] Status could leak viewer identity or reasons. -> Use a fixed formatter with only bounded lifecycle metadata and tests for no raw command/secret echo.
- [Risk] Snapshot could diverge from indicator state. -> Derive state through the same host indicator status mapping used by indicator emission.
