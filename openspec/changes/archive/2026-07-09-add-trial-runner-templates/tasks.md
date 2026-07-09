## 1. Trial Plan Templates

- [x] 1.1 Add reviewed `mvp:run` command-reference templates to relay, host, and viewer `mvp:trial` sections.
- [x] 1.2 Preserve placeholder session/pairing metadata, relay-host substitution, token-env references, foreground acknowledgement, and non-executing output bounds.

## 2. Readiness Validation

- [x] 2.1 Update `mvp:ready` reviewed trial-plan validation to require the new role-runner templates.
- [x] 2.2 Add focused tests for accepted templates and fail-closed drift cases.

## 3. Documentation And Review

- [x] 3.1 Update README trial workflow documentation.
- [x] 3.2 Perform a scoped safety review for token reference handling, foreground-only runner guidance, and non-executing behavior.

## 4. Verification

- [x] 4.1 Run focused trial/readiness tests.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
