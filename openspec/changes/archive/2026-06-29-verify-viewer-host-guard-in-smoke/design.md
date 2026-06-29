# Design

## Approach

The MVP smoke helper already gates the live viewer surface with
`waitForViewerSurfaceGuards()`, which posts fixed negative mutation requests and
maps any failure to `surface-guards-not-ready`. Add one more probe to that same
guard group:

- send `GET /status` against the resolved live loopback surface URL;
- override `Host` with a fixed non-matching value such as
  `example.invalid:80`;
- require an HTTP 4xx response whose JSON body is exactly the existing bounded
  rejection shape `{ ok: false, error: "rejected" }`;
- return false on network errors, unexpected status, malformed JSON, accepted
  requests, or response shape drift.

`fetch()` can set the `Host` header in Node.js for this local test path. The
probe remains local to the smoke process and does not expose the invalid Host
value in public output.

## Failure Mapping

Host-guard drift stays under the existing `surface-guards` subcheck because it
is one of the local surface request-boundary guards. Human and JSON failures
continue to expose only the safe reason `surface-guards-not-ready`.

## Test Strategy

- Unit-test the helper returns true only when the mismatched Host request is
  rejected with bounded JSON.
- Unit-test accepted, 5xx, malformed, and thrown responses fail closed.
- Unit-test the aggregate guard function includes the Host probe.
- Run the full repository verification set before archive.
