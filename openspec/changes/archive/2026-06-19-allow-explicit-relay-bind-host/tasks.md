## 1. Implementation

- [x] 1.1 Add bounded relay bind-host parsing with default loopback.
- [x] 1.2 Pass the configured bind host to relay listener startup.
- [x] 1.3 Update MVP command output to set explicit all-interface bind only for non-loopback relay URLs.

## 2. Tests

- [x] 2.1 Add relay tests for default bind host and explicit `0.0.0.0`.
- [x] 2.2 Add relay tests rejecting malformed or unsupported bind hosts without echoing secrets.
- [x] 2.3 Add command kit tests for local and two-PC relay bind output.

## 3. Review

- [x] 3.1 Security review: confirm no hidden sessions, no auth bypass, no token leak, no stealth networking, and loopback remains default.

## 4. Verification

- [x] 4.1 Run focused relay and command kit tests.
- [x] 4.2 Run `npm run mvp:commands -- --relay ws://192.168.1.10:8787`.
- [x] 4.3 Run `npm run check`.
- [x] 4.4 Run `npm test`.
- [x] 4.5 Run `npm run build`.
- [x] 4.6 Run `npm run openspec:validate`.
