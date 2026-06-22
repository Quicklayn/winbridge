## 1. Implementation

- [x] 1.1 Derive effective relay port from the validated relay URL.
- [x] 1.2 Print `WINBRIDGE_RELAY_PORT` only when the effective port is not `8787`.
- [x] 1.3 Preserve LAN bind-host and token-env command prefix behavior.

## 2. Tests

- [x] 2.1 Assert default relay command does not print `WINBRIDGE_RELAY_PORT`.
- [x] 2.2 Assert custom relay URL port prints `WINBRIDGE_RELAY_PORT`.
- [x] 2.3 Assert custom LAN relay URL composes bind host and relay port.
- [x] 2.4 Keep command generator import-safety tests passing.

## 3. Verification

- [x] 3.1 Run focused command kit tests.
- [x] 3.2 Run `npm run mvp:commands -- --relay ws://192.168.1.10:18787`.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
