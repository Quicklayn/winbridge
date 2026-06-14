## 1. Runtime Status

- [x] 1.1 Extend the host status snapshot type with optional viewer device id and platform fields.
- [x] 1.2 Populate host status viewer device fields only from authorization-bound viewer metadata for the current authorization scope.
- [x] 1.3 Preserve read-only snapshot behavior and ensure status reads remain side-effect-free.

## 2. CLI Status and Docs

- [x] 2.1 Render optional viewer device id/platform in host status output without rendering peer id, display name, or trust level.
- [x] 2.2 Update README, architecture, and security model documentation.

## 3. Tests

- [x] 3.1 Add focused formatting tests for host status device context and trust-level omission.
- [x] 3.2 Add runtime integration coverage for active status device metadata, legacy/no-device omission, and stale disconnect omission.
- [x] 3.3 Run focused agent-shell tests.

## 4. Review and Verification

- [x] 4.1 Validate the active OpenSpec change in strict mode.
- [x] 4.2 Complete a security review for the authorization/user-visible status surface.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.4 Sync accepted delta specs into `openspec/specs/`, archive the completed change, commit, and push.
