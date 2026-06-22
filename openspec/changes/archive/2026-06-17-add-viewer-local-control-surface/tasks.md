## 1. CLI And Surface Wiring

- [x] 1.1 Add viewer-only CLI parsing for `--viewer-control-surface-port`, including safe port bounds and requirement for `--viewer-screen-frame-output`.
- [x] 1.2 Extract/reuse viewer input command send helpers so terminal prompt and local surface share command parsing, authorization checks, sequencing, and metadata-only result formatting.
- [x] 1.3 Implement a loopback-only local viewer control surface that serves static HTML, status JSON, the configured latest frame, input command POSTs, and local disconnect.
- [x] 1.4 Start and stop the local control surface from the agent shell CLI lifecycle without leaving background listeners alive.

## 2. Tests And Documentation

- [x] 2.1 Add argument parser tests for accepted and rejected local surface configurations.
- [x] 2.2 Add focused local viewer surface tests for loopback binding, frame serving, no-frame response, input send, malformed input rejection, stale authorization rejection, sanitized diagnostics, and shutdown.
- [x] 2.3 Update README and MVP/security docs with local viewer surface usage, safety boundaries, and remaining MVP limitations.
- [x] 2.4 Run security review for loopback HTTP exposure, frame file access, input command parsing, authorization gates, audit/redaction behavior, startup/shutdown, service/startup/elevation non-goals, and OpenSpec impact.

## 3. Verification

- [x] 3.1 Validate the OpenSpec change in strict mode before implementation.
- [x] 3.2 Run focused agent-shell tests for args, viewer prompt, and local surface.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Archive the completed OpenSpec change and re-run OpenSpec validation.
