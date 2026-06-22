# Design: Add MVP Relay Host Shortcut

## CLI Behavior

`--relay-host` is a value option accepted by the full command kit and JSON
command-plan modes. It is rejected with `--relay` because those options describe
the same relay endpoint through different forms.

The shortcut builds a WebSocket URL using the current development relay port:

```text
--relay-host 192.168.1.10 -> ws://192.168.1.10:8787/
```

The existing relay URL rendering then handles LAN binding guidance and command
prefixes.

## Validation

Accepted shortcut hosts are bounded host labels suitable for IPv4 literals or
DNS names:

- already trimmed
- no ASCII control or Unicode bidi/zero-width formatting controls
- 1 to 253 characters
- alphanumeric labels separated by dots, with hyphen allowed inside labels
- no embedded scheme, path, port, credentials, query, or fragment
- no secret-bearing marker metadata

Loopback hosts are rejected because the shortcut is for two-PC LAN trials. Same
machine trials can keep using the default `--relay`.
