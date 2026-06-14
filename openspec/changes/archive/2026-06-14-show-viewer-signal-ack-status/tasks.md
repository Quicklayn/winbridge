## 1. Viewer Status Metadata

- [x] 1.1 Record trusted host signal probe acknowledgements on the viewer for the current active authorization only.
- [x] 1.2 Expose optional `signalProbeAckReceived=true` in viewer status snapshots and formatter output.
- [x] 1.3 Clear or omit acknowledgement status after lifecycle loss, local leave, remote disconnect, socket close, or mismatched/untrusted acknowledgement.

## 2. Tests And Docs

- [x] 2.1 Add focused viewer status formatter coverage for acknowledgement metadata and redaction.
- [x] 2.2 Add runtime integration coverage for trusted acknowledgement status and lifecycle-loss omission.
- [x] 2.3 Update README and architecture/security docs for the bounded viewer status field.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for `show-viewer-signal-ack-status`.
- [x] 3.2 Perform security review for signal acknowledgement status metadata.
- [x] 3.3 Run focused affected agent-shell tests.
- [x] 3.4 Run `npm run check`.
- [x] 3.5 Run `npm test`.
- [x] 3.6 Run `npm run build`.
- [x] 3.7 Run `npm run openspec:validate`.
