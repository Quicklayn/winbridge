## Why

The agent shell CLI currently treats any `--visible-session` value other than `true` as false and ignores unknown options. That is fail-closed, but it can hide operator mistakes in consent-sensitive workflow exercises.

## What Changes

- Move agent shell argument parsing into a testable module.
- Reject unknown CLI options instead of silently ignoring them.
- Require `--visible-session` to be either `true` or `false` when provided.
- Convert invalid pairing, permission, integer, and host-decision inputs into bounded usage errors.
- Add unit tests for default parsing, strict visible-session parsing, unknown option rejection, and invalid permission rejection.
- Safety impact: makes consent and visibility simulation configuration explicit and less error-prone.
- Non-goals: no native UI, capture, input, clipboard, file transfer, installer, startup, services, privilege elevation, or production auth changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add CLI argument validation requirements for explicit consent/visibility simulation configuration.

## Impact

- Affected code: `apps/agent-shell/src/index.ts`, new argument parser module, and tests.
- APIs: invalid or unknown agent shell CLI arguments now exit through usage instead of being ignored or surfacing raw parser errors.
- Dependencies: none.
- Touched areas: user-visible agent shell workflow and consent simulation configuration. Does not touch capture, input, relay routing, installer behavior, startup behavior, services, token storage, or privilege elevation.
