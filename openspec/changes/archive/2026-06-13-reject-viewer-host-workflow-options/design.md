## Context

The agent shell has separate host and viewer roles. Host-only options control approval, visible activation, lifecycle simulation, and local host controls; viewer options request permissions and observe host-authorized state. Some host-only CLI options are already rejected on viewers, but others are parsed into runtime options where they have no legitimate viewer meaning.

## Goals / Non-Goals

**Goals:**

- Make viewer rejection of host workflow configuration consistent across CLI and direct runtime construction.
- Fail before relay connection, protocol sends, workflow audit emission, host visibility activation, or timer scheduling.
- Preserve existing valid viewer-only development flows.

**Non-Goals:**

- No screen capture, input injection, clipboard, file transfer, diagnostics, native Windows API, installer, service, startup, token, relay, or privilege changes.
- No production account or authorization model changes.
- No changes to host workflow semantics when the runtime role is host.

## Decisions

- Add a single CLI guard that rejects explicit host-only option names for viewer role before individual host option parsing. This treats `--host-consent-prompt false`, `--host-decision none`, and `--visible-session false` as invalid viewer configuration because the option itself is host-scoped.
- Add a direct runtime guard for viewer runtimes that rejects host workflow state which can be represented in runtime options: static approve/deny, `visibleToHost: true`, authorization TTL, host lifecycle timers, revoke permission, and host workflow reasons. Runtime `false` or `none` defaults remain accepted because direct runtime construction cannot distinguish omitted defaults from explicit no-op values.
- Keep existing specialized validation for malformed values. For example, invalid permissions and malformed reasons still fail through their existing validation paths before the role-boundary guard.

Alternatives considered:

- Leave no-op viewer host options accepted. Rejected because ambiguous no-ops make future native UI and automation harder to reason about.
- Reject all viewer runtime `visibleToHost` and `hostDecision` values, including default `false` and `none`. Rejected for direct runtime options because defaults are represented as ordinary values in many tests and helper code.

## Risks / Trade-offs

- Existing scripts that explicitly pass host-only no-op flags to viewer mode will now fail usage validation -> mitigated by documenting the stricter role boundary and leaving viewer-native options unchanged.
- Runtime guard cannot detect explicit no-op defaults from callers -> mitigated by enforcing exact explicit CLI rejection where raw option presence is available.
