## Context

The local smoke check starts a development relay, host, and viewer with static
frames and explicit host approval. Recent command-kit work added a
non-authorizing viewer signal probe and host acknowledgement path so the viewer
can expose bounded readiness metadata after active visible `screen:view`
authorization.

## Design

The smoke plan will pass `--host-signal-probe-ack true` to the host and
`--viewer-signal-probe-after-ms 0` to the viewer. The zero delay keeps the local
preflight fast while preserving the same runtime authorization gates as the
ordinary bounded signal probe.

After verifying the viewer surface HTML and `/frame`, the smoke runner will
poll the loopback `/status` endpoint until the sanitized JSON reports
`ok=true` and `state.signalProbeAckReceived=true`. The smoke runner only uses a
boolean readiness result. It does not print the status body, authorization id,
signal markers, child process output, pairing code, or surface URL.

## Failure Handling

If the signal acknowledgement is not observed before the deadline, the smoke
check fails closed with the bounded reason `signal-not-ready`, stops all child
processes, and performs the existing artifact cleanup behavior.

## Non-Goals

- No production signaling or WebRTC implementation changes.
- No Windows capture, OS input application, browser automation, startup
  persistence, service installation, privilege elevation, hidden session, or
  unattended access behavior.
- No exposure of raw signal payloads, authorization ids, tokens, pairing codes,
  screen contents, input contents, or private reasons in smoke diagnostics.
