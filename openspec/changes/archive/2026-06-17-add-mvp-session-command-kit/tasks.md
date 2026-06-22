## 1. Implementation

- [x] 1.1 Add an importable root command generator script for MVP relay, host,
      viewer, and browser steps.
- [x] 1.2 Validate command-kit inputs and reject raw token handling with
      bounded diagnostics before printing commands.
- [x] 1.3 Add focused tests for valid output, fail-closed validation, token env
      handling, and non-execution boundaries.
- [x] 1.4 Add the root npm script and document the MVP command workflow.
- [x] 1.5 Security review the generated commands against consent, visibility,
      revocation, audit, token, startup/service, and prohibited capability
      boundaries.

## 2. Verification

- [x] 2.1 Run focused tests for the command kit.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
