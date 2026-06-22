## Design

`mvp:doctor` already accepts injectable filesystem readers for tests. Add a
fixed list of expected source entrypoint files and validate them with the same
passive `exists` dependency used for workspace manifests.

The check reports:

- `entrypoints=ok` on success.
- `missing-entrypoint` on failure.

No path values are printed. The check uses only `existsSync` through the
existing injection seam and does not import process spawning, socket, HTTP,
WebSocket, capture, or input adapters.

## Security Rationale

The doctor remains a readiness validator, not an execution path. It must not
start remote assistance, grant permissions, read screenshots, inject input,
open network sockets, or surface local secrets. The extra check is intentionally
static and bounded.

## Alternatives

- Running `npm run build` from doctor: rejected because doctor should stay fast
  and non-orchestrating.
- Checking native Windows API behavior: rejected because that belongs to
  explicit capture/input verification and must stay consent-bound.
