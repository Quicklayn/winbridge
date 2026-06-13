## 1. OpenSpec Preparation

- [x] 1.1 Validate the proposed OpenSpec change artifacts with strict validation before implementation.

## 2. Viewer Prompt Implementation

- [x] 2.1 Extend viewer control prompt parsing and handling to accept exact `help` as a read-only static output command.
- [x] 2.2 Add focused viewer control prompt tests for accepted `help`, malformed help rejection, and no runtime status/leave/host-control/send calls.

## 3. Documentation

- [x] 3.1 Update README and architecture/security docs to include the viewer prompt `help` command and its read-only safety boundary.

## 4. Verification

- [x] 4.1 Run focused viewer control prompt tests.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Perform a safety review confirming the change adds no capture, input, clipboard, file-transfer, auth, relay, installer, startup, service, token, logging, or privilege behavior.
