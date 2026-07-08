## Design

`scripts/mvp-lan-probe.mjs` is a small Node CLI that uses the existing protocol
package and `ws` client to perform only relay admission and room readiness.

The CLI accepts:

- `--role host|viewer`
- `--relay ws://host:port/`
- `--session <id>`
- `--pairing <000-000>`
- `--peer <id>`
- `--device <id>`
- `--timeout-ms <1000-60000>`
- `--token-env <ENV_NAME>`
- `--json`

On start it validates all options, reads only the configured token environment
variable when present, connects to the relay, sends a `join-session` envelope,
and waits for a `relay-ready` envelope for the local peer with `roomSize >= 2`.
The process then closes its own socket and exits successfully.

## Security Rationale

The probe deliberately stops at transport/session readiness. It does not send
`hello`, consent, authorization, signal, screen-frame, input-event,
session-control, or audit-event envelopes. This makes it useful as a preflight
between real PCs while keeping it outside the sensitive remote-control path.

Diagnostics are fixed reason codes. Text output and JSON output may report
role, timeout, check names, and bounded status, but MUST NOT echo raw relay
URLs, token values, token environment values, pairing codes, protocol payloads,
close reasons, exception messages, stdout/stderr from child processes, screen
contents, input contents, local file paths, credentials, or full secrets.

## Alternatives

- Reuse `mvp:smoke -- --lan-relay`: rejected because that is still a local
  multi-process smoke check, not a two-machine probe.
- Add more command-plan validation only: rejected because the gap is live
  network reachability and pairing, not command formatting.
- Use full agent-shell sessions: rejected for this increment because the probe
  should fail before consent/capture/input workflows are involved.
