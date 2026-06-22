## 1. Runtime Wiring

- [x] 1.1 Add `@winbridge/windows-input` as an agent-shell dependency and expose host runtime input-application options.
- [x] 1.2 Validate host-only input application configuration before relay startup, requiring explicit opt-in and local audit configuration.
- [x] 1.3 Invoke metadata-only local input-application audit after inbound authorization gates and before Windows input adapter invocation.
- [x] 1.4 Build the Windows input adapter grant snapshot from active host authorization, visible state, permissions, expiry, and connected viewer state.
- [x] 1.5 Keep adapter/audit failures generic and prevent raw pointer, keyboard, command output, token, pairing-code, or credential leakage.

## 2. CLI, Tests, And Documentation

- [x] 2.1 Add CLI parsing/tests for host-only input application opt-in, audit requirement, and viewer/default rejection.
- [x] 2.2 Add runtime integration tests for authorized pointer and keyboard adapter invocation after audit.
- [x] 2.3 Add runtime integration tests for disabled opt-in, missing audit, audit failure, stale authorization, disconnect, wrong permission, and adapter failure.
- [x] 2.4 Update README/architecture/roadmap/threat model/privacy docs for host input application status and remaining MVP gaps.
- [x] 2.5 Run security review for input application, authorization, diagnostics/logs, services/startup/elevation non-goals, and OpenSpec impact.
- [x] 2.6 Validate the OpenSpec change in strict mode.

## 3. Verification

- [x] 3.1 Run focused agent-shell input application tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the completed OpenSpec change and re-run OpenSpec validation.
