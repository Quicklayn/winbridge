## 1. Planning and Safety

- [x] 1.1 Validate the OpenSpec change strictly before implementation.
- [x] 1.2 Review audit/log safety boundaries and confirm the helper remains read-only.

## 2. Strict Audit Evidence Gate

- [x] 2.1 Add bounded CLI parsing for `--require-mvp-evidence`.
- [x] 2.2 Fail closed with fixed reason metadata when required MVP evidence is missing.
- [x] 2.3 Keep default audit summary mode compatible for partial evidence summaries.
- [x] 2.4 Add tests for strict success, strict missing evidence failure, JSON failure, and redaction.

## 3. Command Kit and Readiness

- [x] 3.1 Update the generated post-run audit command to include `--require-mvp-evidence`.
- [x] 3.2 Update readiness validation to require the reviewed strict audit command entry.
- [x] 3.3 Update tests and README/OpenSpec docs for the strict post-run gate.

## 4. Verification

- [x] 4.1 Run targeted audit-summary, command-kit, and ready tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
- [x] 4.6 Perform security review for audit/log output and command rendering.
