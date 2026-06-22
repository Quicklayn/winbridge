## 1. Implementation

- [x] 1.1 Add `scripts/mvp-native-preflight.mjs` with read-only platform and PowerShell prerequisite checks.
- [x] 1.2 Expose `npm run mvp:native-preflight`.
- [x] 1.3 Add native preflight to `mvp:doctor` required root scripts.
- [x] 1.4 Add native preflight to the printed MVP command preflight section.
- [x] 1.5 Document the command in README.

## 2. Tests

- [x] 2.1 Cover success formatting and check aggregation.
- [x] 2.2 Cover unsupported platform and bounded failure reason output.
- [x] 2.3 Cover malformed CLI usage without raw value leakage.
- [x] 2.4 Cover that fixed PowerShell scripts do not contain `CopyFromScreen`, `SendInput(` invocation, execution-policy bypass, sockets, services, startup persistence, browser launch, or file writes.
- [x] 2.5 Update command kit and doctor tests for the new preflight.

## 3. Security Review

- [x] 3.1 Review changed files for no capture invocation, no input invocation, no raw diagnostics, no network/socket/browser/service/startup/elevation/unattended/evasion/prompt-bypass behavior.

## 4. Verification

- [x] 4.1 Run focused native preflight tests.
- [x] 4.2 Run focused command kit and doctor tests.
- [x] 4.3 Run `npm run mvp:native-preflight`.
- [x] 4.4 Run `npm run check`.
- [x] 4.5 Run `npm test`.
- [x] 4.6 Run `npm run build`.
- [x] 4.7 Run `npm run openspec:validate`.
- [x] 4.8 Run strict OpenSpec validation for this change.
