# Design: Build Windows input before MVP agent runs

The root `dev:agent` script is the command printed by the MVP command kit for both host and viewer. The host command includes `--host-apply-input true`, which makes agent-shell load its `@winbridge/windows-input` dependency.

The minimal fix is to extend the existing script chain:

1. Build `@winbridge/protocol`.
2. Build `@winbridge/windows-capture`.
3. Build `@winbridge/windows-input`.
4. Start `@winbridge/agent-shell`.

This keeps the workflow explicit and non-executing until the user runs the printed command in a visible terminal. It does not add background work, persistence, or hidden behavior.

Regression coverage lives in `scripts/mvp-session-commands.test.ts` because that file already verifies the generated MVP command shape and can read root `package.json` without starting any remote-assistance process.
