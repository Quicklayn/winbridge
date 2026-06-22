## Design

Add a short "Relay address" section to the generated `mvp:commands` output
before the relay terminal step. The section is static text except for the
already validated relay URL.

The output should state:

- Current relay URL being printed.
- `localhost` is same-machine only.
- For two PCs, rerun the command kit with a LAN IP or DNS relay URL.

No network probing or IP discovery is added. The command kit remains a pure
formatter.

## Security Rationale

Avoiding IP auto-detection prevents leaking local network details and keeps the
tool deterministic. The user must explicitly choose the relay address and run
the printed commands in visible terminals.
