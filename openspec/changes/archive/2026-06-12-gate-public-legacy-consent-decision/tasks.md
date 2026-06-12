## 1. Runtime Send Gate

- [x] 1.1 Add legacy `host-consent-decision` to the public workflow-authority send gate.
- [x] 1.2 Preserve public legacy `host-consent-required` request behavior as non-granting request semantics.
- [x] 1.3 Preserve existing public gate behavior for current workflow-authority messages and signals.

## 2. Verification Coverage

- [x] 2.1 Add integration coverage proving public legacy `host-consent-decision` sends are blocked before socket write and local `sent` event emission.
- [x] 2.2 Add regression coverage proving legacy `host-consent-required` is not treated as a public workflow-authority decision.
- [x] 2.3 Update agent-shell consent workflow specs and docs with the legacy decision gate behavior.

## 3. Review And Gates

- [x] 3.1 Run focused agent-shell tests for legacy public consent sends.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Perform security review for auth/log handling and archive the completed OpenSpec change.
