## 1. Command Kit

- [x] 1.1 Add bounded `--host-control-surface-port` parsing, defaults, usage text, and rendered host command output.
- [x] 1.2 Add text guidance for ephemeral host local surface URLs without fabricating `127.0.0.1:0` or launching a host browser.
- [x] 1.3 Add command-kit tests for default, custom, preflight omission, JSON, role-filter, and malformed host surface port behavior.

## 2. Readiness

- [x] 2.1 Update `mvp:ready` command-plan and role-filter validation to require the reviewed host surface argument.
- [x] 2.2 Add readiness tests that fail closed when host surface command output drifts.

## 3. Documentation and Review

- [x] 3.1 Update README MVP workflow guidance to include the host local control surface in generated command plans.
- [x] 3.2 Perform a security review for consent, visibility, revocation, token/log redaction, and non-executing behavior.

## 4. Verification

- [x] 4.1 Run focused command-kit and readiness tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
