## Why

Viewer runtimes already have a one-shot status print for future UI wiring and CLI diagnostics, while host runtimes expose the same bounded status only through the interactive control prompt. A host-only one-shot status helper gives development operators and tests a non-interactive way to inspect host visibility and permission state without adding remote access.

## What Changes

- Add `--host-status-after-ms <delay>` to the agent shell CLI.
- Print the existing bounded host status snapshot after the configured delay while the ordinary host runtime remains governed by its existing startup and workflow rules.
- Reject malformed, viewer-mode, or ambiguous host status configuration before runtime startup.
- Keep the helper read-only: no lifecycle controls, protocol sends, workflow audit writes, reconnects, capture, input, clipboard, file-transfer, diagnostics, installer, startup, service, token, or privilege behavior.
- Document the helper in README, architecture, and security model docs.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add host-only one-shot status CLI validation and output requirements.

## Impact

- Affected code: `apps/agent-shell/src/args.ts`, `apps/agent-shell/src/index.ts`, new host status helper/tests, and existing host status formatting.
- Affected docs: README, architecture, and security model.
- Affected specs: `openspec/specs/agent-shell-consent-workflow/spec.md`.
- Safety impact: improves host-side observability during development without granting permissions or performing sensitive actions. The scheduled status read itself remains read-only and does not add protocol sends, controls, audit writes, reconnect, capture, or input behavior.
- Non-goals: screen capture, input injection, clipboard, file transfer, diagnostics collection, hidden sessions, reconnect, relay changes, authentication changes, audit persistence changes, installer/startup/service behavior, token handling, and privilege elevation.
