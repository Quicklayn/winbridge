## Context

The agent shell host control prompt is a non-native development surface for
host-only lifecycle controls. Existing runtime gates already require active
visible authorization for local host disconnect and deactivate the host
indicator when the disconnect succeeds. The prompt itself currently continues
reading command lines after invoking `runtime.disconnect()`.

## Goals / Non-Goals

**Goals:**

- Close the host control prompt after a successful exact `disconnect` command.
- Preserve existing behavior for `help`, `status`, `pause`, `resume`,
  `revoke`, and `terminate`.
- Preserve failed-disconnect error reporting and keep the prompt available
  after failure.
- Avoid sending any new protocol, lifecycle, signal, control, or audit
  messages because of prompt shutdown.

**Non-Goals:**

- No protocol changes.
- No relay changes.
- No native Windows UI or background service behavior.
- No screen capture, input injection, reconnect, unattended access, or hidden
  session capability.

## Decisions

1. Pass a prompt-local stop callback into host control line handling.
   - Rationale: the viewer control prompt already uses a local stop callback
     for disconnect, and keeping the lifecycle local avoids coupling runtime
     internals to readline.
   - Alternative considered: stop the prompt from `runtime.disconnect()`.
     Rejected because runtime controls should not own terminal prompt state.

2. Stop only after `runtime.disconnect()` returns without throwing.
   - Rationale: failed disconnects are important safety feedback, commonly
     caused by missing visible authorization, stale sessions, or disconnected
     peers. Keeping the prompt open lets the host inspect status or choose a
     valid control.
   - Alternative considered: stop before invoking disconnect. Rejected because
     it would hide actionable failure recovery in the prompt.

## Risks / Trade-offs

- Risk: closing readline synchronously could affect the accepted output order.
  Mitigation: tests assert both accepted output and prompt close behavior.
- Risk: failed disconnect could accidentally stop the prompt.
  Mitigation: add a regression test with a throwing runtime disconnect.
- Risk: prompt shutdown might be mistaken for a remote protocol action.
  Mitigation: keep shutdown local to readline and assert no unrelated runtime
  controls are invoked.
