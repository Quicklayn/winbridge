## Why

The agent shell can simulate host consent with a preconfigured `--host-decision`, but it cannot ask the host operator for an explicit decision when a viewer request arrives. A small interactive consent path makes the development host workflow closer to real remote assistance without adding screen capture, input, persistence, or native Windows behavior.

## What Changes

- Add an opt-in interactive host consent mode for the non-native agent shell.
- When enabled, host mode prompts on each `session-authorization-request` and sends approval only after an explicit accepted response.
- Denial, prompt cancellation, prompt failure, or invalid prompt configuration fail closed without granting access or visible-session state.
- Prompt output and local events remain secret-safe and do not expose raw tokens, pairing codes, protocol payloads, private reasons, screen contents, input contents, clipboard contents, file-transfer contents, or diagnostics dumps.
- Static `--host-decision none|approve|deny` remains available for deterministic tests and non-interactive automation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: host consent workflow gains an opt-in interactive approval/denial path that preserves explicit consent, host visibility gating, audit ordering, and fail-closed behavior.

## Impact

- Affected code: `apps/agent-shell/src/args.ts`, `apps/agent-shell/src/index.ts`, `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/args.test.ts`, `apps/agent-shell/src/runtime.integration.test.ts`, and focused CLI prompt tests if a small helper module is introduced.
- Affected docs/specs: `openspec/specs/agent-shell-consent-workflow/spec.md`, `README.md`, `docs/architecture.md`, and `docs/security-model.md`.
- Touches host consent/auth workflow and logs. Does not touch native Windows APIs, screen capture, input injection, clipboard sync, file transfer, relay routing, installer behavior, startup persistence, background services, shared tokens, production identity, or privilege elevation.
