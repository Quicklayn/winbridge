## 1. Relay Disconnect Audit Hardening

- [x] 1.1 Add a guarded disconnect audit write path for `relay.peer.disconnect` after close cleanup.
- [x] 1.2 Ensure disconnect audit sink failure cannot undo notification, stale membership cleanup, or orphan closure.
- [x] 1.3 Ensure disconnect audit warning logging is static, secret-safe, and guarded against logger failure.

## 2. Regression Coverage

- [x] 2.1 Add relay integration coverage for host disconnect cleanup when disconnect audit persistence fails.
- [x] 2.2 Add relay integration coverage for viewer disconnect notification when disconnect audit persistence fails.
- [x] 2.3 Add relay integration coverage proving disconnect audit warning logger failure cannot escape the close path.

## 3. Documentation

- [x] 3.1 Update security documentation to describe disconnect cleanup vs post-cleanup disconnect audit diagnostics.

## 4. Review and Verification

- [x] 4.1 Perform security review for relay close-path audit/logging impact.
- [x] 4.2 Run focused relay typecheck and integration tests.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.4 Archive the completed OpenSpec change after implementation and verification.
