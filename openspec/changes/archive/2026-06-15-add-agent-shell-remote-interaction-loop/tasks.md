## 1. Runtime API And Gates

- [x] 1.1 Add explicit agent-shell runtime methods and types for development screen-frame and input-event sends.
- [x] 1.2 Add local role, peer routing, authorization id, active visible authorization, expiration, and permission gates for remote interaction sends.
- [x] 1.3 Add metadata-only accepted local audit records before remote interaction socket writes, with audit failure blocking send.
- [x] 1.4 Add inbound remote interaction handling that accepts only matching authorized frame/input messages and never performs native capture, rendering, or input side effects.
- [x] 1.5 Add redacted sent/received event summaries for screen-frame and input-event payloads.

## 2. Tests And Documentation

- [x] 2.1 Add agent-shell integration tests for authorized host screen-frame send and viewer receipt.
- [x] 2.2 Add agent-shell integration tests for authorized viewer pointer and keyboard input sends and host receipt.
- [x] 2.3 Add tests for missing, paused, revoked, expired, wrong-permission, wrong-authorization, wrong-peer, and audit-failure remote interaction rejection.
- [x] 2.4 Add tests proving runtime events, logs, errors, and audit details do not expose frame bytes, screen contents, pointer details, key details, modifiers, or raw input payloads.
- [x] 2.5 Update architecture/security documentation for the non-native remote interaction exerciser boundary.
- [x] 2.6 Run security review for capture/input/auth/audit/log changes.
- [x] 2.7 Validate the OpenSpec change in strict mode.

## 3. Verification

- [x] 3.1 Run focused agent-shell remote interaction tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
