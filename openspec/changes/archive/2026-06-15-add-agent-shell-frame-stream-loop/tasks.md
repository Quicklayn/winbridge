## 1. CLI Parser And Stream Scheduler

- [x] 1.1 Add host-only CLI argument types and usage text for finite development frame streaming.
- [x] 1.2 Add bounded validation for stream count, positive interval, compatible one-shot/stream options, and derived frame ids.
- [x] 1.3 Extend the remote interaction CLI scheduler with a finite screen-frame stream loop that waits for active visible authorization and calls `sendScreenFrame()` once per frame.
- [x] 1.4 Stop the stream on configured count completion, runtime rejection, authorization loss, local stop, or shutdown without adding native capture, rendering, reconnect, service, startup, elevation, or input behavior.
- [x] 1.5 Wire stream handles into CLI startup and shutdown without changing relay or protocol schemas.

## 2. Tests And Documentation

- [x] 2.1 Add parser tests for valid host stream configuration and invalid role/count/interval/frame-id cases.
- [x] 2.2 Add scheduler tests for bounded count, interval cadence, waiting for authorization, stop behavior, and authorization-loss stop.
- [x] 2.3 Add runtime integration tests for authorized host CLI frame stream delivery and viewer receipt with metadata-only events/audit.
- [x] 2.4 Add tests proving stream errors and diagnostics do not expose raw frame bytes, screen contents, or encoded payloads.
- [x] 2.5 Update README/roadmap for the non-native stream boundary and future native-capture handoff.
- [x] 2.6 Run security review for frame streaming, authorization, audit, diagnostics, and log changes.
- [x] 2.7 Validate the OpenSpec change in strict mode.

## 3. Verification

- [x] 3.1 Run focused agent-shell frame stream tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the completed OpenSpec change and re-run OpenSpec validation.
