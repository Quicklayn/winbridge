## Why

The explicit Windows input smoke gate currently looks for the fixed
`agent-shell.remote-interaction.input-event.applied` audit action, but the
helper does not require that evidence to have an accepted outcome. MVP evidence
for native input application must fail closed when the host records only
denied, failed, malformed, or partial audit evidence.

## What Changes

- Require the `windows-input` smoke subcheck to accept host audit evidence only
  when the fixed input-applied action has outcome `accepted`.
- Keep denied, failed, malformed, missing, or wrong-action evidence on the
  existing bounded `windows-input-not-ready` failure path.
- Add focused regression coverage for accepted versus denied/failed Windows
  input audit evidence.
- Clarify README and OpenSpec wording so native input smoke evidence is
  accepted-outcome evidence.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: explicit Windows input smoke must require accepted
  host audit evidence for the fixed input-applied action before reporting the
  `windows-input` subcheck as passed.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs` and focused smoke tests.
- Affected docs/specs: README and `openspec/specs/mvp-session-command-kit`.
- Touches native-input smoke evidence validation and audit/log parsing only.
- Does not add new input behavior, enable OS input by default, change relay or
  auth protocols, install services, configure startup persistence, add
  unattended access, elevate privileges, retrieve credentials, read clipboard
  contents, keylog, evade AV/EDR, bypass Windows prompts, or hide
  capture/session/input activity.
