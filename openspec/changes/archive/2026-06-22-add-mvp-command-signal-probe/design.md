# Design

## Overview

The command kit will include the existing signal probe flags in the printed
host and viewer commands:

- host: `--host-signal-probe-ack true`
- viewer: `--viewer-signal-probe-after-ms <delay>`

The default delay is `1000` milliseconds. Developers may override it with
`--viewer-signal-probe-after-ms`, using the same exact integer timer bound used
by other command-kit millisecond options.

## Safety

The command kit still only prints text. The printed probe flags rely on existing
agent-shell validation and runtime gates: viewer role, explicit `screen:view`
request, active visible authorization, trusted peer routing, pause/revoke/
termination/expiration/disconnect checks, and signal payload redaction. The
probe remains readiness metadata only and does not grant access or carry remote
control payloads.

## Testing

Add focused command-kit tests for:

- default host acknowledgement and viewer signal probe delay rendering,
- custom bounded signal probe delay rendering,
- malformed signal probe delay rejection.
