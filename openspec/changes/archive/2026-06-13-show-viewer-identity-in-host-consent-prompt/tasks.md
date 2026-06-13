## 1. Runtime And Prompt Implementation

- [x] 1.1 Extend `HostDecisionProviderRequest` with trusted viewer peer id and optional validated display name.
- [x] 1.2 Track observed peer display name from accepted `hello` messages and clear it on reset or peer disconnect.
- [x] 1.3 Pass viewer identity metadata into the host decision provider only after inbound request binding gates have accepted the request.
- [x] 1.4 Render viewer identity and requested permission metadata in the interactive host consent prompt while preserving exact `approve`/`deny` parsing and timeout fail-closed behavior.

## 2. Tests And Documentation

- [x] 2.1 Update host consent prompt unit tests for viewer identity rendering, fallback behavior, and secret-safe prompt text.
- [x] 2.2 Update runtime integration tests to assert provider request identity metadata and no raw display-name leakage in logs, audit, or authorization decision/state events.
- [x] 2.3 Update README, architecture, and security docs to describe host-facing viewer identity in the development prompt.

## 3. Verification

- [x] 3.1 Run targeted prompt and runtime tests covering interactive consent identity metadata.
- [x] 3.2 Complete security review for consent identity source, prompt output boundaries, and fail-closed behavior.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`, including any needed test-runner stability fix discovered during verification.
