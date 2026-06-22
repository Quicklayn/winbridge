## 1. Implementation

- [x] 1.1 Add relay-address guidance to generated MVP commands.
- [x] 1.2 Keep generated guidance bounded and non-executing.

## 2. Tests

- [x] 2.1 Assert default output warns that localhost is same-machine only.
- [x] 2.2 Assert custom relay output includes the validated relay URL without raw token handling.
- [x] 2.3 Keep import-safety tests proving command generation imports no process/network/filesystem APIs.

## 3. Verification

- [x] 3.1 Run focused command kit tests.
- [x] 3.2 Run `npm run mvp:commands`.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
