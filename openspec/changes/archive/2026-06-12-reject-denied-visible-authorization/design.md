## Context

`denied` is produced when the host rejects a pending authorization request. It
does not come from an active visible session and terminal denied records carry no
permissions. Revoked, terminated, and expired records can be historical terminal
states after a visible active session, so they should remain allowed to report
host visibility while still carrying no permissions.

## Goals / Non-Goals

**Goals:**

- Reject denied authorization records and denied protocol state messages with
  `visibleToHost: true`.
- Preserve existing pre-active (`pending`, `approved`) visibility rejection.
- Preserve active/paused visibility requirements and terminal fail-closed
  permission clearing.

**Non-Goals:**

- Do not reject visible `revoked`, `terminated`, or `expired` states solely
  because they are terminal.
- Do not change host decision or activation message flow.
- Do not add native capture, input, clipboard, file transfer, services,
  installers, startup persistence, or privilege behavior.

## Decisions

- Extend the existing pre-active visibility guard to include `denied`, but name
  it as non-visible status validation rather than treating all terminal states
  the same.
- Keep rejection at schema parse time. Future adapters should fail before using
  malformed lifecycle state.

## Risks / Trade-offs

- A sender that emits denied state updates with `visibleToHost: true` will now
  fail validation -> mitigation: denial is not active-session visibility, and
  denial decisions can still be represented without state visibility.
- The distinction between denied and other terminal states is subtle ->
  mitigation: specs and tests explicitly document the difference.
