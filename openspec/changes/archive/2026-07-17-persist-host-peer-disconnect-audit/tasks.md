## 1. Trusted Disconnect Audit

- [x] 1.1 Capture a fixed bounded host audit snapshot only after the existing trusted observed-viewer disconnect gate and only when host authorization exists.
- [x] 1.2 Complete input/capture blocking, disconnected recipient state, signaling invalidation, and host indicator deactivation before scheduling one local `agent-shell.session.disconnected` write without protocol sends or retry.
- [x] 1.3 Contain slow, failed, and hostile audit/diagnostic behavior without exposing raw errors or weakening disconnect cleanup.

## 2. Regression Coverage

- [x] 2.1 Extend the real relay trusted-viewer-disconnect integration path to assert one exact bounded host record, correct correlation, post-cleanup ordering, and no sent protocol audit/disconnect event.
- [x] 2.2 Prove self, unbound, same-role, mismatched, duplicate, pre-authorization, and same-id post-terminal rebind attempts do not create accepted authorization-bound host disconnect evidence or restore peer binding.
- [x] 2.3 Prove slow and failing audit sinks plus failing diagnostics cannot delay or undo capture/input blocking, recipient clearing, signaling invalidation, inactive host visibility, or secret-safe output.

## 3. Documentation And Verification

- [x] 3.1 Update security documentation for local host trusted-viewer-disconnect evidence and its post-cleanup best-effort boundary.
- [x] 3.2 Run a security review of relay trust binding, audit correlation and metadata, one-shot scheduling, failure containment, cleanup ordering, protocol-send absence, and diagnostic redaction; resolve blocking findings.
- [x] 3.3 Run focused agent-shell tests and default `npm run mvp:smoke -- --json`; confirm host `disconnectObserved` passes and record the independent viewer required-action mapping failure as a separate change.
- [x] 3.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.5 Run strict change validation, sync the delta spec, and archive the completed OpenSpec change.
