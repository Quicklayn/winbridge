## Context

The command kit can print a full session plan or one role-specific command
block through `--only relay|host|viewer|browser|preflight`. Default
`mvp:ready` validates those role-filtered text outputs so operators can use
per-machine blocks before a two-PC trial.

The full JSON command-plan parser already validates the native control path:

- host: `--host-apply-input 'true'`
- host: `--dev-screen-frame-source 'windows-capture'`
- viewer: `--request 'screen:view,input:pointer,input:keyboard'`
- viewer: `--viewer-screen-frame-output 'frames\latest.jpg'`

The role-filter parser currently checks consent, host visibility, host control
surface, viewer request, and viewer control surface markers, but not all native
control markers.

## Goals / Non-Goals

**Goals:**

- Require the host role-filter output to preserve reviewed host native input
  and Windows capture markers.
- Require the viewer role-filter output to preserve the reviewed latest-frame
  output marker in addition to the existing request marker.
- Reuse the existing role-filter parser so LAN and token-env role-filter
  checks inherit the stronger contract.
- Keep failure output bounded and avoid echoing generated command strings,
  paths, URLs, pairing codes, token references, or token values.

**Non-Goals:**

- No changes to command generation options or runtime execution.
- No native capture/input execution from readiness.
- No browser automation, relay/socket start, HTTP listener start beyond the
  existing runtime commands when a human explicitly runs them.
- No services, startup persistence, installer behavior, elevation, unattended
  access, keylogging, credential access, clipboard access, Windows prompt
  bypass, or hidden-session behavior.

## Decisions

1. Add exact reviewed fragments to `roleFilterMarkersForTarget`.
   - Rationale: role-filter parsing already works by requiring fixed safe
     markers and forbidding cross-role blocks. The command kit emits
     deterministic quoted fragments, so exact marker checks are enough.

2. Let LAN/token-env agent role-filter checks reuse the strengthened parser.
   - Rationale: those checks already call `parseRoleFilteredCommandReadiness`
     before validating LAN URL and token-env shape. This keeps the additional
     native control requirements consistent.

## Risks / Trade-offs

- Intentional command formatting changes can break readiness until markers and
  tests are updated together. That is acceptable because native capture/input
  command fragments are security-sensitive operator instructions.
- This still does not prove live Windows capture/input works; it proves the
  per-machine command text preserves the reviewed path before a human runs it.
