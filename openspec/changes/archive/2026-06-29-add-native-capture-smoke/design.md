## Context

`mvp:smoke` currently starts local relay, host, and viewer development
processes, uses explicit host approval with visible-session state, and verifies
the viewer surface, protocol input path, audit, revocation, and disconnect.
It deliberately uses static frames, so it does not prove that the existing
Windows capture adapter can provide a real consent-bound frame in the same MVP
path.

The repository already has a reviewed Windows capture boundary and host CLI
flag, `--dev-screen-frame-source windows-capture`, guarded by active visible
`screen:view` authorization. The safest next step is to add an explicit smoke
mode that selects that existing path while keeping every other smoke behavior
bounded and local.

## Goals / Non-Goals

**Goals:**
- Add explicit `mvp:smoke --windows-capture` support.
- Fail closed before process startup on non-Windows platforms.
- Keep output bounded to fixed smoke check metadata and optional sanitized
  audit summary.
- Preserve explicit host approval, visible session state, finite capture count,
  viewer surface guards, revocation, and disconnect checks.
- Keep OS input application disabled in smoke.

**Non-Goals:**
- No hidden capture, unattended access, browser automation, public relay bind,
  installer/startup/service behavior, privilege elevation, or Windows prompt
  bypass.
- No production desktop UI or production deployment hardening.
- No OS input application in smoke; the existing input check remains a
  protocol/local-surface send path only.
- No frame bytes, screen content, paths, raw token values, pairing codes,
  command output, stdout, stderr, or child diagnostics in success/failure
  output.

## Decisions

1. Use a dedicated `--windows-capture` flag instead of changing default smoke.
   Default smoke remains portable and static. Native capture requires explicit
   operator intent because it reads the local Windows screen.

2. Reuse the existing host development capture flag. The smoke plan should set
   `--dev-screen-frame-source windows-capture` and omit static frame payload
   arguments when native capture is selected. This avoids introducing a second
   capture path.

3. Fail closed on unsupported platforms before spawning child processes. This
   prevents confusing partial smoke runs and avoids claiming native capture was
   checked where it cannot run.

4. Keep the smoke subcheck names stable. The existing `frame` and `audit`
   checks can prove that a frame reached the viewer output and that metadata
   audit evidence exists; success output does not need a new frame payload or
   file path.

## Risks / Trade-offs

- Native capture may fail in headless Windows sessions -> report a bounded
  `native-capture-unsupported` or existing frame readiness failure without
  leaking PowerShell diagnostics.
- Real screen content is captured locally during the check -> require explicit
  flag, active visible authorization, finite frame count, no stdout frame
  echoing, and cleanup by default.
- Smoke remains local rather than two-PC distributed -> this verifies the
  native capture path in the same consent workflow, while LAN two-PC launch
  remains driven by the command kit.
