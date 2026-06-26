## Context

The viewer local control surface already binds to loopback, uses a per-run
mutation token, and routes accepted input through `sendViewerControlInputEvent`.
The generated page currently enables all input controls when the sanitized
viewer status is active, visible, and has a positive permission count. That can
make the page look ready for input when the active grant contains only
`screen:view`.

The runtime has the authoritative permission list, but `/status` intentionally
does not expose authorization ids or raw permission lists to the browser page.

## Goals / Non-Goals

**Goals:**

- Expose bounded per-kind input readiness booleans in viewer status snapshots.
- Keep the local surface status response free of authorization ids and raw
  permission lists.
- Gate pointer UI on `input:pointer` readiness and keyboard UI on
  `input:keyboard` readiness.
- Keep server-side `/input` authorization, permission, routing, audit, and
  redaction gates unchanged.

**Non-Goals:**

- No changes to native Windows input execution.
- No changes to authorization protocol semantics or granted permissions.
- No production desktop viewer UI.
- No clipboard, file transfer, diagnostics, remote shell, unattended access,
  persistence, privilege elevation, or relay behavior changes.

## Decisions

- Add metadata-only readiness booleans instead of exposing permission arrays.
  - Rationale: the browser needs enough state to enable controls accurately,
    but raw permission lists and authorization ids are unnecessary surface area.
  - Alternative considered: expose the permission list and let the page decide.
    Rejected because it increases status detail without improving security.
- Compute readiness in the runtime from active visible authorization state.
  - Rationale: the runtime already owns authorization snapshots and permission
    revocation state, so the local surface does not need to infer permission
    kind from `permissionCount`.
- Keep `sendViewerControlInputEvent` as the authoritative gate.
  - Rationale: browser UI gates are ergonomic only; server-side runtime checks
    must still decide every input POST.

## Risks / Trade-offs

- UI may disable a manual mixed command when only one input kind is ready.
  - Mitigation: manual send remains enabled when either pointer or keyboard is
    ready; the runtime still rejects a command whose exact permission is absent.
- Existing tests may assume a minimal viewer status shape.
  - Mitigation: add optional booleans only when relevant in runtime snapshots
    and sanitize to explicit booleans in the local surface response.
- Future input kinds would need explicit readiness metadata.
  - Mitigation: current MVP protocol supports pointer and keyboard only; future
    permissions should get their own OpenSpec change.
