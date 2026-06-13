## 1. Spec Updates

- [x] 1.1 Update session authorization requirements for control/format-control reason rejection.
- [x] 1.2 Update agent-shell workflow requirements for CLI/runtime reason rejection and secret-safe diagnostics.

## 2. Validator Updates

- [x] 2.1 Harden shared authorization reason validation.
- [x] 2.2 Harden agent-shell CLI workflow reason validation.
- [x] 2.3 Harden agent-shell direct runtime workflow reason validation.

## 3. Regression Tests

- [x] 3.1 Add protocol transition and parsed-record tests for unsafe reason characters.
- [x] 3.2 Add agent-shell CLI tests for unsafe workflow reason characters and secret-safe diagnostics.
- [x] 3.3 Add agent-shell runtime tests for unsafe workflow reason characters and secret-safe diagnostics.

## 4. Verification And Review

- [x] 4.1 Run focused protocol and agent-shell tests.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Complete security review for authorization/log-adjacent reason handling and resolve findings.
- [x] 4.4 Sync implemented requirements into main specs.
- [x] 4.5 Archive the OpenSpec change after implementation and validation.
