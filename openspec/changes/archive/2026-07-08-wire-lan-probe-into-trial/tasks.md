## 1. LAN Probe Shortcut

- [x] 1.1 Add `--relay-host <host>` parsing to `mvp:lan-probe`.
- [x] 1.2 Reject unsafe, duplicate, loopback, unspecified, secret-bearing, and `--relay`-combined host shortcuts.
- [x] 1.3 Keep output bounded and avoid printing derived relay URLs.

## 2. Trial, Ready, and Doctor Integration

- [x] 2.1 Add host/viewer LAN probe command-reference steps to `mvp:trial`.
- [x] 2.2 Update `mvp:ready` trial-plan parsing for the reviewed probe steps.
- [x] 2.3 Update `mvp:doctor` script and entrypoint checks for `mvp:lan-probe`.
- [x] 2.4 Update README and main OpenSpec specs.
- [x] 2.5 Perform a security review.

## 3. Verification

- [x] 3.1 Run focused LAN probe, trial, ready, and doctor tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
