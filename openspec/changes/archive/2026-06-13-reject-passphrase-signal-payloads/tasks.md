## 1. OpenSpec Preparation

- [x] 1.1 Validate the proposed OpenSpec change artifacts with strict validation before implementation.

## 2. Protocol Validation

- [x] 2.1 Add protocol tests proving passphrase-bearing signal payload keys are rejected during parse and encode.
- [x] 2.2 Add `passphrase` to the signal payload sensitive-key marker list without changing safe lifecycle metadata handling.

## 3. Verification

- [x] 3.1 Run the focused protocol test file.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Perform a security review confirming the change only tightens signal payload validation and adds no capture, input, auth, relay routing, installer, startup, service, token, logging, or privilege behavior.
