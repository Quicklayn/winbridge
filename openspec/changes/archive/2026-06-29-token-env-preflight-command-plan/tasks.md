## 1. Implementation

- [x] 1.1 Allow token-env on preflight-only command parsing while rejecting all other preflight-specific options.
- [x] 1.2 Render text and JSON preflight-only all-smoke commands with the token-env assignment.
- [x] 1.3 Add default `mvp:ready` validation for token-env preflight JSON output.

## 2. Tests and Docs

- [x] 2.1 Add command-kit tests for text and JSON token-env preflight plans and malformed combinations.
- [x] 2.2 Add readiness tests for token-env preflight JSON validation and drift failures.
- [x] 2.3 Update README command-kit and readiness documentation.
- [x] 2.4 Add a security review note for token-handling impact.

## 3. Verification

- [x] 3.1 Run `npm run check`.
- [x] 3.2 Run `npm test`.
- [x] 3.3 Run `npm run build`.
- [x] 3.4 Run `npm run openspec:validate`.
