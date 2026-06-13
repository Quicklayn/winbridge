## 1. Runtime Lifecycle Guard

- [x] 1.1 Add a bounded duplicate-active-start guard before `start()` opens a WebSocket.
- [x] 1.2 Preserve explicit restart after a fully closed or stopped runtime connection.

## 2. Tests And Docs

- [x] 2.1 Add focused runtime tests proving duplicate active start opens no second transport and emits no protocol side effects.
- [x] 2.2 Add focused runtime tests proving restart after a stopped or fully closed connection still uses the normal startup path.
- [x] 2.3 Update developer-facing architecture/security text for the runtime start lifecycle guard.

## 3. Review And Verification

- [x] 3.1 Review the diff against consent-first safety invariants and confirm no capture, input, auth-state-machine, relay-routing, token, logging, installer, startup, service, or privilege behavior changed.
- [x] 3.2 Run focused tests, typecheck, full test suite, build, and strict OpenSpec validation.
