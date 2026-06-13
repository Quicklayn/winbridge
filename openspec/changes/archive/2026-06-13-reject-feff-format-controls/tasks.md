## 1. Validator Updates

- [x] 1.1 Add `U+FEFF` to protocol display-name format-control rejection.
- [x] 1.2 Add `U+FEFF` to agent-shell CLI/runtime token format-control rejection.
- [x] 1.3 Add `U+FEFF` to relay shared-token format-control rejection.

## 2. Regression Tests

- [x] 2.1 Add protocol display-name regression tests for `U+FEFF` in device identity, `hello`, and legacy consent request paths.
- [x] 2.2 Add agent-shell CLI/runtime regression tests for `U+FEFF` display names and relay tokens with secret-safe diagnostics.
- [x] 2.3 Add relay shared-token regression tests for `U+FEFF` with secret-safe diagnostics.

## 3. Documentation And Specs

- [x] 3.1 Update user-facing/docs references so display names and development tokens consistently mention bidi/zero-width formatting controls where relevant.
- [x] 3.2 Sync implemented OpenSpec requirements into the main specs.

## 4. Verification And Review

- [x] 4.1 Run focused tests for protocol display names, agent-shell argument/runtime validation, and relay shared-token validation.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Complete security review for relay/token/display-name handling and resolve findings.
- [x] 4.4 Archive the OpenSpec change after implementation and validation.
