## 1. Runtime Event Hardening

- [x] 1.1 Update `AgentShellEvent` and the WebSocket close handler so `closed` events expose redacted reason text plus safe reason-byte metadata.
- [x] 1.2 Add focused runtime integration coverage proving server-provided close reason text is absent from local closed events and logs.

## 2. Documentation and Specs

- [x] 2.1 Update architecture and security documentation to state that runtime closed events are metadata-only/redacted.
- [x] 2.2 Sync the accepted delta requirement into `openspec/specs/agent-shell-consent-workflow/spec.md`.

## 3. Verification and Review

- [x] 3.1 Run focused agent-shell runtime tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for the log/event handling changes.
- [x] 3.4 Archive the completed OpenSpec change after validation.
