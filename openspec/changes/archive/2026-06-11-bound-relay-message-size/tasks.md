## 1. Relay Size Gate

- [x] 1.1 Add a relay raw WebSocket message byte limit before protocol decode.
- [x] 1.2 Route oversized message rejections through existing invalid-message audit and rate-limit behavior without raw payload logging.

## 2. Tests

- [x] 2.1 Add relay integration coverage for oversized registered peer messages returning relay errors and not forwarding.
- [x] 2.2 Run focused relay tests for message size behavior.

## 3. Verification

- [x] 3.1 Run security review for relay abuse-protection impact.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
