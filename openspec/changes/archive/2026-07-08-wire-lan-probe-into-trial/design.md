## Design

`mvp:lan-probe` accepts either `--relay ws://host:port/` or
`--relay-host <host>`. The shortcut reuses the same bounded host validation
shape as other MVP helpers and derives `ws://<host>:8787/` internally. It
rejects loopback, unspecified, malformed, and secret-bearing hosts because the
shortcut is intended for two-PC LAN readiness. Existing explicit `--relay`
continues to support localhost for tests and advanced diagnostics.

`mvp:trial` adds a `lan-probe` command-reference step to host and viewer
sections. The command reference is intentionally not a generated runtime
command. It uses placeholders for session and pairing metadata and references
`--relay-host <relay-pc-lan-ip>` plus the reviewed token env name. When
`mvp:trial -- --relay-host <host>` is supplied, only the relay-host placeholder
is substituted; session and pairing placeholders remain placeholders.

`mvp:ready` continues to validate trial plan JSON without executing probe
commands. `mvp:doctor` only checks package script alignment and entrypoint
presence for the new helper.

## Security Rationale

This change keeps the LAN probe pre-authorizing and keeps the trial helper
non-executing. The new trial output does not include generated relay URLs,
pairing codes, token values, local URLs, audit records, frame bytes, screen
contents, input contents, stdout, stderr, child output, credentials, or full
secrets.

The probe shortcut does not add discovery, firewall changes, persistence, or
privilege behavior. It only derives a relay URL from a validated operator-supplied
LAN host and then uses the existing join-only probe path.
