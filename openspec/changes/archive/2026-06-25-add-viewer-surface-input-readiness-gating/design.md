## Context

The viewer local control surface already polls sanitized `/status` metadata and
requires token-protected POSTs for input and disconnect. The server and runtime
reject input unless active visible authorization and required permissions are
present. The browser UI, however, keeps visible controls enabled while that
state is not ready.

## Goals / Non-Goals

**Goals:**

- Maintain a local `inputReady` flag from sanitized viewer status and displayed
  frame readiness.
- Disable visible input controls until input is locally ready.
- Preserve disconnect availability so the viewer can leave even when input is
  not ready.
- Preserve server/runtime enforcement as the security boundary.

**Non-Goals:**

- No new server endpoint or protocol field.
- No permission-specific UI matrix; this remains a compact MVP readiness gate.
- No changes to input command parsing or runtime authorization.
- No native Windows capture/input, clipboard, file transfer, diagnostics,
  installer, service, startup, privilege, or prompt behavior changes.

## Decisions

- Derive UI readiness from existing sanitized status fields:
  `state=active`, `visibleToHost=true`, and `permissionCount>0`.
- Combine status readiness with `frameReady` before enabling controls that can
  send input. This keeps pointer/key attempts tied to a visible frame.
- Leave the command input text field editable for preparation, but disable the
  Send button until ready. This avoids trapping typed text while preventing
  accidental sends.

## Risks / Trade-offs

- Permission count does not distinguish pointer vs keyboard grants. Mitigation:
  this is only a UI affordance; runtime gates still enforce exact permissions
  and redact failures.
- Status polling is eventual, so controls may lag briefly after authorization
  changes. Mitigation: server-side checks remain authoritative for every POST.
