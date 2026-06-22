## Design

Add `createRelayBindHostConfig(env)` to parse `WINBRIDGE_RELAY_BIND_HOST`.
Default is `127.0.0.1`. The initial allowlist is intentionally small:

- `127.0.0.1`
- `localhost`
- `0.0.0.0`

`createRelayRuntime` receives `bindHost`, passes it to `server.listen`, and
keeps `runtime.url()` loopback-oriented for tests and local diagnostics. The
relay startup log continues to use `runtime.url()`.

For `mvp:commands`, if the validated relay URL host is not loopback, the
printed relay command sets `WINBRIDGE_RELAY_BIND_HOST=0.0.0.0` before
`npm run dev:relay`. Localhost output remains unchanged.

## Security Rationale

Binding to all interfaces is an explicit operator action, not a default.
The command kit does not probe network interfaces or choose an address. Users
must supply the relay URL and keep the session visible.

## Review Notes

This change touches relay networking and requires security review before
archive.
