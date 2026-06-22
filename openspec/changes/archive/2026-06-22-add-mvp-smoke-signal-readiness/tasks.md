## 1. Smoke Runner

- [x] 1.1 Add the bounded signal probe and host acknowledgement flags to the
  MVP smoke process plan.
- [x] 1.2 Poll the sanitized viewer `/status` endpoint for
  `signalProbeAckReceived=true` and fail closed with `signal-not-ready` when it
  is not observed before the deadline.
- [x] 1.3 Include bounded signal readiness metadata in text and JSON success
  output without exposing raw status, tokens, pairing codes, or signal payloads.

## 2. Tests and Docs

- [x] 2.1 Add focused smoke-runner tests for the new signal readiness plan,
  status helper, success output, and safe failure reason.
- [x] 2.2 Update README smoke documentation to describe the signal readiness
  preflight.
- [x] 2.3 Run focused tests, `npm run check`, `npm test`, `npm run build`, and
  OpenSpec validation.
