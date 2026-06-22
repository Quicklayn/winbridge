## Why

The current MVP command workflow must choose between an interactive host
approve/deny prompt and immediate host terminal controls because
`--host-consent-prompt true` and `--host-control-prompt true` are mutually
exclusive. A usable consent-first MVP needs both: the host should see the
viewer request before approval and still have immediate pause, revoke,
terminate, and disconnect controls after approval.

## What Changes

- Allow a host CLI invocation to combine `--host-consent-prompt true` with
  `--host-control-prompt true`.
- Delay host control prompt startup until after the interactive consent prompt
  resolves to approval and the runtime emits an active visible host indicator.
- Keep malformed, viewer-mode, one-shot status conflicting, and non-boolean
  host control prompt options fail-closed.
- Update the MVP command kit to print the interactive consent prompt workflow
  instead of static host approval.
- Keep hidden startup, services, unattended access, credential collection,
  clipboard, file transfer, diagnostics collection, privilege elevation,
  AV/EDR evasion, Windows prompt bypass, and hidden capture/input out of scope.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: host control prompt CLI validation and prompt
  startup semantics now allow safe sequencing after interactive consent.
- `mvp-session-command-kit`: generated host commands now use interactive host
  consent plus delayed host controls for the MVP workflow.

## Impact

- Affected code: `apps/agent-shell/src/args.ts`, `apps/agent-shell/src/index.ts`,
  related tests, `scripts/mvp-session-commands.mjs`, README, and OpenSpec specs.
- Security impact: touches host consent/control workflow and user-visible MVP
  launch commands. It improves host approval visibility and preserves existing
  runtime authorization, revocation, audit, capture, and input gates.
- Non-goals: no production identity, no service/installer/startup behavior, no
  background supervisor, no unattended access, no new native capture/input
  primitive, no clipboard, no file transfer, no diagnostics, no remote shell, no
  privilege elevation, no AV/EDR evasion, and no Windows prompt bypass.
