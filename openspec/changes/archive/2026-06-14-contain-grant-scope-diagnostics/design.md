## Context

`resolveHostGrantedPermissions` rejects an approval path when `hostGrantPermissions` contains any permission the viewer did not request. That decision happens before authorization state, host indicator activation, workflow audit, signal authorization, capture, or input. A direct diagnostic logger call in the rejection branch can throw and cause `handleMessage` to report a runtime error even though the runtime already chose a safe fail-closed result.

## Goals / Non-Goals

**Goals:**

- Make the configured grant-scope mismatch diagnostic log best-effort.
- Preserve the fail-closed result when configured grant permissions are not requested.
- Cover runtime error containment, secret-safe logger text, and unchanged blocked signal behavior.

**Non-Goals:**

- Do not change configured grant-scope validation, host approval/denial decisions, host consent provider behavior, workflow audit persistence, visible authorization, lifecycle timers, signal authorization, relay behavior, or public send authority checks.
- Do not catch or suppress failures from required audit persistence or event callbacks.
- Do not add native capture, input, installer, service, startup persistence, privilege elevation, stealth, or bypass behavior.

## Decisions

- Route only the configured grant-scope mismatch diagnostic log through `logRuntimeMessageBestEffort`.
  - Rationale: diagnostic logging must not convert an intentional fail-closed grant mismatch into a runtime error.
  - Alternative considered: wrap all grant resolution. Rejected because grant resolution errors and future validation failures should keep their current failure behavior unless separately specified.

- Test the static approval path with a mismatched configured grant.
  - Rationale: it exercises the exact branch while proving an attempted approval remains non-authorizing.

## Risks / Trade-offs

- [Risk] A broken logger may miss the explanatory grant-scope line. -> Mitigation: no authorization messages or active state are emitted, and working loggers retain the same message.
- [Risk] Containment could be mistaken for ignoring grant mismatches. -> Mitigation: tests assert no decision, no active state, no indicator, no audit, and blocked signal sends.

## Migration Plan

No migration is required. Runtime API, protocol schema, and CLI options are unchanged.

## Open Questions

None.
