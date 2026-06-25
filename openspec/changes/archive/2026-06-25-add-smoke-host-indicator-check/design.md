## Context

The host runtime already emits bounded local host indicator events and logs a
metadata-only line containing fixed fields such as indicator state,
authorization status, visibility, permission count, and cause. `mvp:smoke`
captures bounded child output internally for readiness checks but does not
currently assert that the visible host indicator became active.

## Goals / Non-Goals

**Goals:**

- Verify that smoke host output contains a bounded active visible host indicator
  marker before the smoke run is considered ready.
- Add a fixed `indicator` subcheck to smoke and ready aggregation.
- Keep failures metadata-only with a bounded reason code.

**Non-Goals:**

- No runtime indicator redesign.
- No production Windows tray, overlay, service, installer, or startup behavior.
- No raw host stdout/stderr exposure in smoke or ready output.
- No native capture, OS input, browser automation, clipboard, file transfer, or
  diagnostics collection.

## Decisions

- Implement the check in `mvp:smoke` rather than runtime because the runtime
  already emits the required visible indicator marker.
- Match only fixed safe substrings:
  `host indicator`, `state=active`, `visibleToHost=true`, and a positive
  `permissionCount`.
- Do not print the matched line or child output. Fail with `indicator-not-ready`
  only.

## Risks / Trade-offs

- The check depends on current bounded log wording. Mitigation: cover the log
  marker with focused tests and keep the matcher narrow.
- This verifies the non-native terminal indicator for the development MVP only;
  a production Windows indicator remains a future OpenSpec change.
