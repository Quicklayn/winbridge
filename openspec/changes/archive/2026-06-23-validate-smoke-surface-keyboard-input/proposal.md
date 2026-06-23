## Why

The MVP smoke check currently verifies the viewer local control surface input path with one pointer command only. After adding explicit keyboard controls and modifier toggles, the automated readiness gate should also validate a bounded keyboard command path without using browser automation or OS input application.

## What Changes

- Extend the root MVP smoke check to submit one bounded keyboard command with modifiers through the existing token-protected local `/input` endpoint after the pointer command succeeds.
- Keep the public smoke output unchanged and bounded under the existing `input` check.
- Preserve the static local smoke scope: no Windows capture, no host OS input application, no browser automation, no keyboard capture, no clipboard, and no raw command leakage.

## Capabilities

### New Capabilities

### Modified Capabilities

- `mvp-session-command-kit`: the smoke check's local static workflow validates both pointer and keyboard command acceptance through the viewer surface input path.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`, `scripts/mvp-session-smoke.test.ts`, README, and the `mvp-session-command-kit` spec.
- Affected workflow: `npm run mvp:smoke` readiness validation.
- Security impact: touches input validation only. The change does not apply OS input, invoke native input, capture keyboard events, add browser automation, read clipboard data, alter authorization, change relay behavior, or expose tokens/logs.
