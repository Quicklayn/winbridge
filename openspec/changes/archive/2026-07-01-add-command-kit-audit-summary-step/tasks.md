## 1. Planning and Safety

- [x] 1.1 Validate the OpenSpec change strictly before implementation.
- [x] 1.2 Review command-plan and audit-summary boundaries to confirm the new step remains non-executing.

## 2. Command Kit Output

- [x] 2.1 Add a reusable post-run audit summary command renderer using validated host/viewer audit log options.
- [x] 2.2 Add the post-run audit summary section to full text output and preflight-only text output.
- [x] 2.3 Add `preflight.audit-summary` to full JSON and preflight-only JSON command plans.

## 3. Ready Validation

- [x] 3.1 Update `mvp:ready` preflight command-plan validation to require the fixed audit summary command.
- [x] 3.2 Add failure coverage for missing, malformed, duplicate, and token-bearing audit summary command metadata.

## 4. Tests and Docs

- [x] 4.1 Update command-kit tests for text and JSON audit summary output.
- [x] 4.2 Update ready-helper tests for bounded audit summary command-plan validation.
- [x] 4.3 Update README workflow docs for the generated post-run audit summary step.
- [x] 4.4 Perform a security review for log guidance, command output, and non-execution boundaries.

## 5. Verification

- [x] 5.1 Run targeted command-kit and ready-helper tests.
- [x] 5.2 Run `npm run check`.
- [x] 5.3 Run `npm test`.
- [x] 5.4 Run `npm run build`.
- [x] 5.5 Run `npm run openspec:validate`.
