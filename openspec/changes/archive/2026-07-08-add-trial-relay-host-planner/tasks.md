## 1. Trial Relay Host Planning

- [x] 1.1 Add `--relay-host <host>` parsing and validation to `mvp:trial` plan mode.
- [x] 1.2 Substitute validated relay hosts only into bounded `mvp:commands` command-reference steps.
- [x] 1.3 Reject unsafe, duplicate, loopback, unspecified, secret-bearing, and evidence-mode relay-host usage without echoing raw values.

## 2. Readiness, Docs, and Review

- [x] 2.1 Update readiness trial-plan parsing to preserve default validation and accept reviewed relay-host plan output when explicitly tested.
- [x] 2.2 Update README and main OpenSpec specs for relay-host trial planning.
- [x] 2.3 Perform a security review for relay-host command-reference planning.

## 3. Verification

- [x] 3.1 Run focused trial and ready tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
