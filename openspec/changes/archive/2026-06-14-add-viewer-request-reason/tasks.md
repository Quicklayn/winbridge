## 1. CLI and Runtime

- [x] 1.1 Add viewer-only `--request-reason` argument parsing, usage text, and direct runtime option validation using existing secret-safe reason rules.
- [x] 1.2 Include the request reason in outbound `session-authorization-request.reason` when provided.
- [x] 1.3 Preserve existing no-reason request behavior and runtime event reason redaction.

## 2. Host Prompt and Docs

- [x] 2.1 Display the validated request reason, or `unavailable`, in the interactive host consent prompt before accepting `approve` or `deny`.
- [x] 2.2 Update README development workflow documentation for `--request-reason` and its safety constraints.

## 3. Tests

- [x] 3.1 Add CLI argument tests for viewer acceptance, host rejection, and unsafe request reason rejection before runtime startup.
- [x] 3.2 Add runtime integration coverage proving outbound request reasons are sent only after paired room readiness and unsafe direct runtime values fail before relay connection.
- [x] 3.3 Add host consent prompt tests for reason display and omitted reason fallback.
- [x] 3.4 Run focused agent-shell tests.

## 4. Review and Verification

- [x] 4.1 Validate the active OpenSpec change in strict mode.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Complete security review for auth/user-visible workflow changes and confirm no consent, visibility, revoke, capture, input, relay, installer, startup, service, token, log, persistence, privilege elevation, hidden-session, or Windows prompt-bypass behavior was added or weakened.
- [x] 4.4 Sync accepted delta specs into `openspec/specs/`, archive the completed change, commit, and push.
