## Design

Derive the relay listener port from the already validated relay URL. If the URL
has no explicit port, use its effective default:

- `ws` -> `80`
- `wss` -> `443`

The command kit currently defaults to `ws://localhost:8787/`, so only suppress
`WINBRIDGE_RELAY_PORT` when the effective port is `8787`. Otherwise prepend
`$env:WINBRIDGE_RELAY_PORT = '<port>';` to the relay command.

This composes with existing command prefixes:

1. optional `WINBRIDGE_RELAY_BIND_HOST`
2. optional `WINBRIDGE_RELAY_PORT`
3. optional relay shared-token environment bridge
4. `npm run dev:relay`

No network probing or process execution is added.
