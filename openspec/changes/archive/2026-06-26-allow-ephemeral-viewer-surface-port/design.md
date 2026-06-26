# Design

## CLI Validation

The agent shell parser will accept `0` as a special viewer control surface port
only through the existing `--viewer-control-surface-port` option. All existing
gates remain: viewer role only, explicit frame output required, and frame output
requires `screen:view` plus local audit configuration.

## Listener

The local surface already listens on the configured port and reads the resolved
`server.address().port`. With port `0`, Node assigns an available loopback port.
The ready log continues to include only the resolved loopback URL, not the local
mutation token.

## Command Kit

The command kit will accept `--viewer-control-surface-port 0`. The viewer
command renders the literal `0`. Because the browser URL is not known before
the viewer process starts, the browser step renders a bounded instruction to
open the URL printed by the viewer command log. Default fixed-port output still
renders the existing `Start-Process 'http://127.0.0.1:35987/'`.
