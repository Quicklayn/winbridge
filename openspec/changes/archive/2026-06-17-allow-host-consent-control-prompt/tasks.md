## 1. Implementation

- [x] 1.1 Allow host CLI parsing to combine `--host-consent-prompt true` with
      `--host-control-prompt true` while preserving host-only and host-status
      conflict validation.
- [x] 1.2 Start host control prompt once after active visible authorization when
      interactive host consent prompt mode is enabled.
- [x] 1.3 Update MVP command generation and documentation to use interactive
      host consent plus delayed host controls.
- [x] 1.4 Add focused tests for parser validation, delayed prompt startup,
      denial/no-start behavior, and command kit output.
- [x] 1.5 Security review the consent/control sequencing against stdin
      ambiguity, denial/timeout, revocation, audit, and prohibited capability
      boundaries.

## 2. Verification

- [x] 2.1 Run focused tests for args, CLI sequencing, and command kit.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
