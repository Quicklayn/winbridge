## 1. Planning and Safety

- [x] 1.1 Validate the OpenSpec change strictly before implementation.
- [x] 1.2 Confirm the change remains non-executing command-plan output.

## 2. Command Plan

- [x] 2.1 Add the fixed `preflight.ready-windows-control-smoke` entry to full-session and preflight-only JSON output.
- [x] 2.2 Add the Windows control smoke gate to human preflight output.
- [x] 2.3 Require the fixed entry and exact command in `mvp:ready` command-plan validation.

## 3. Tests and Docs

- [x] 3.1 Update command-kit tests for text, JSON, preflight-only, and token-env output.
- [x] 3.2 Update ready tests for command-plan drift validation.
- [x] 3.3 Update README and main OpenSpec spec with the fixed Windows control preflight entry.
- [x] 3.4 Run security review for native control command-plan semantics.

## 4. Verification

- [x] 4.1 Run targeted command-kit and ready tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
