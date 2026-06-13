## Why

Viewer CLI invocations can currently carry host-only consent and lifecycle options that either do nothing or fail later in a less direct runtime path. Rejecting those options before relay startup keeps role boundaries explicit and reduces ambiguous development configurations around consent, visibility, and host controls.

## What Changes

- Reject explicit host-only workflow CLI options on viewer runtimes before creating the managed runtime.
- Reject direct viewer runtime options that attempt to configure host approval, host visibility, host lifecycle timers, host revocation, host workflow reasons, or authorization TTL.
- Keep valid viewer-only options such as requested permissions, viewer status, viewer local disconnect, and viewer signal probe unchanged.
- Safety impact: this is fail-closed validation hardening. It does not add capture, input, clipboard, file transfer, diagnostics, relay behavior, installer behavior, startup persistence, services, tokens, logs, privilege elevation, or any remote action.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: clarify and enforce that host-only consent, visibility, and lifecycle workflow configuration is rejected on viewer runtimes before runtime or relay startup.

## Impact

- `apps/agent-shell/src/args.ts`: CLI role validation for explicit host workflow options.
- `apps/agent-shell/src/runtime.ts`: direct runtime option validation for viewer host workflow configuration.
- `apps/agent-shell/src/args.test.ts` and `apps/agent-shell/src/runtime.integration.test.ts`: focused fail-closed coverage.
- `README.md`, `docs/architecture.md`, and `docs/security-model.md`: document viewer rejection of host-only workflow options.
