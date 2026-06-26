# Design

## Approach

`createMvpSmokePlan` will continue to accept an explicit `surfacePort` for
tests, but the runtime smoke default will use `0`. For a `0` plan, the viewer
command starts the existing loopback-only local control surface in ephemeral
port mode and does not know the final URL up front.

After the viewer process starts, smoke will poll the viewer child output for
the existing ready marker:

```text
[winbridge-agent] viewer local control surface url=http://127.0.0.1:<port>/
```

The parser will accept only a bounded output buffer, `http`, host `127.0.0.1`,
root path `/`, no query/fragment/credentials, and a valid non-zero TCP port.
The resolved URL is then used internally for the existing surface, status,
guard, input, lifecycle, audit, and disconnect checks.

## Failure Behavior

If the marker is missing, malformed, unsafe, duplicated incompatibly, or the
viewer exits before it appears, smoke fails closed with the existing bounded
`surface-not-ready` path. Human and JSON diagnostics stay bounded and do not
echo the unsafe output or URL.

## Security Rationale

The change removes a port reservation race in smoke without expanding network
surface. The agent surface still binds only to `127.0.0.1`; smoke only parses
that exact loopback URL from the viewer process it started and never launches a
browser or opens a public listener.
