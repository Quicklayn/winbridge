## Why

The MVP command flow can authorize capture correctly but still fail to show a useful first frame because primary-screen PNG output can exceed the protocol's 48 KiB screen-frame payload bound. A bounded preview encoder is needed now so the Windows-to-Windows MVP can reliably display authorized frames in the viewer surface.

## What Changes

- Change the Windows capture adapter's reviewed native path to emit a bounded JPEG preview by default, using downscaling and quality fallback before returning output.
- Keep strict validation of active visible grants, dimensions, format, base64 size, and image signatures before returning any frame.
- Preserve PNG compatibility in the adapter parser for static or future runner outputs, while reporting the actual adapter format to the protocol runtime.
- Update the agent shell capture path so captured frames are sent as `image/jpeg` or `image/png` based on the adapter output instead of hardcoding `image/png`.
- Update the MVP command kit and docs to use a `.jpg` latest-frame path by default for the native capture workflow.
- Harden the local viewer surface so it clears stale latest-frame files on startup, serves only a frame written during the current run, and requires same-origin per-run mutation tokens for local input/disconnect POSTs.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `windows-screen-capture`: Native capture output changes from PNG-only to bounded JPEG preview by default with validated JPEG/PNG output.
- `agent-shell-consent-workflow`: Windows capture frames sent by the CLI use the adapter-reported image format while preserving existing consent, visibility, audit, and revocation gates; the development local viewer surface rejects stale frame files and cross-origin mutation attempts.

## Impact

- Affected code: `packages/windows-capture`, `apps/agent-shell`, `scripts/mvp-session-commands.mjs`, README and architecture/security docs.
- APIs: `WindowsScreenCaptureFrame.format` expands from `"png"` to `"jpeg" | "png"`; protocol messages already support `image/jpeg` and `image/png`.
- Dependencies: no new runtime dependency.
- Safety impact: touches capture and the existing development local viewer surface guards. It does not add hidden capture, unattended access, persistence, service installation, privilege elevation, input capture, credential access, AV/EDR evasion, Windows prompt bypass, or new authorization behavior.
